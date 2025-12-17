
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

// Create singleton transporter instance with connection pooling
let transporter = null;
let transporterReady = false;

function getTransporter() {
    if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            pool: true, // Enable connection pooling
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5
        });

        // Verify transporter on first creation
        transporter.verify((error, success) => {
            if (error) {
                transporterReady = false;
            } else {
                transporterReady = true;
            }
        });
    }
    return transporter;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, securityAnswer } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // secutity check
    const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
    if (xssPattern.test(email) || (securityAnswer && xssPattern.test(securityAnswer))) {
        return res.status(400).json({ message: 'Invalid input detected' });
    }

    try {
        const { data: user } = await supabase
            .from('users')
            .select('id, email, security_answer, lockout_until, failed_login_attempts')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(400).json({ message: 'Account not found' });
        }

        //  Lockout Check
        if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
            const waitTime = Math.ceil((new Date(user.lockout_until) - new Date()) / 60000);
            return res.status(429).json({
                message: `Account locked due to too many failed attempts. Please try again in ${waitTime} minutes.`
            });
        }


        if (!process.env.SKIP_SECURITY_CHECK) {
            if (!user.security_answer) {
                return res.status(400).json({ message: 'No security answer set. Contact support.' });
            }

            if (!securityAnswer || user.security_answer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
                // Tracking Failed Security Question attempts
                const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
                let updateData = { failed_login_attempts: newFailedAttempts };

                if (newFailedAttempts >= 5) {
                    const lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                    updateData.lockout_until = lockoutTime;
                }

                await supabase
                    .from('users')
                    .update(updateData)
                    .eq('id', user.id);

                const remainingAttempts = 5 - newFailedAttempts;
                if (remainingAttempts > 0) {
                    return res.status(401).json({ message: `Incorrect security answer. ${remainingAttempts} attempts remaining.` });
                } else {
                    return res.status(429).json({
                        message: 'Account locked. Please try again in 15 minutes.',
                    });
                }
            }
        }

        await supabase
            .from('users')
            .update({ failed_login_attempts: 0, lockout_until: null })
            .eq('id', user.id);

        // Generate Secure Token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 Hour Expiry

        const { error: insertError } = await supabase
            .from('password_resets')
            .insert({
                user_id: user.id,
                token: token,
                expires_at: expiresAt
            });

        if (insertError) throw insertError;

        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
        const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        // Email Dispatch with proper error handling
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const emailTransporter = getTransporter();

            if (!emailTransporter) {
                return res.status(500).json({
                    message: 'Email service unavailable. Please contact support.'
                });
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'NBA Trivia - Password Reset',
                html: `
                    <h3>Password Reset Request</h3>
                    <p>You requested a password reset for your NBA Trivia account.</p>
                    <p>Click the link below to verify your email and set a new password:</p>
                    <p><a href="${resetLink}">Reset Password</a></p>
                    <p>This link expires in 1 hour.</p>
                `
            };

            try {
                const info = await emailTransporter.sendMail(mailOptions);

                return res.status(200).json({
                    message: 'Password reset link has been sent to your email.'
                });
            } catch (emailErr) {
                // Return error to user instead of hiding it
                return res.status(500).json({
                    message: 'Failed to send email. Please try again or contact support.'
                });
            }
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}
