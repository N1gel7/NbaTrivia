
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }

    // Prevent script injection attacks by blocking common HTML/JS patterns
    const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
    if (xssPattern.test(username)) {
        return res.status(400).json({ message: 'Invalid input detected (XSS protection)' });
    }

    try {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (fetchError || !user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check if account is temporarily locked from too many failed attempts
        if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
            const waitTime = Math.ceil((new Date(user.lockout_until) - new Date()) / 60000);
            return res.status(429).json({
                message: `Account locked. Please try again in ${waitTime} minutes.`,
                lockoutUntil: user.lockout_until
            });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            // Track failed attempts to prevent brute force attacks
            const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
            let updateData = { failed_login_attempts: newFailedAttempts };

            // Lock account for 15 minutes after 5 failed attempts
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
                return res.status(401).json({ message: `Invalid username or password. ${remainingAttempts} attempts remaining.` });
            } else {
                return res.status(429).json({
                    message: 'Account locked. Please try again in 15 minutes.',
                    lockoutUntil: updateData.lockout_until
                });
            }
        }


        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: (user.role || 'user').trim().toLowerCase()
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Clear failed attempts on successful login
        await supabase
            .from('users')
            .update({
                last_active: new Date().toISOString(),
                failed_login_attempts: 0,
                lockout_until: null
            })
            .eq('id', user.id);

        return res.status(200).json({
            token,
            user: {
                username: user.username,
                email: user.email,
                role: (user.role || 'user').trim().toLowerCase()
            }
        });

    } catch (error) {
        console.error('Login API Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
