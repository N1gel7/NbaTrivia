
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

    // Comprehensive XSS Protection
    const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
    if (xssPattern.test(username)) {
        return res.status(400).json({ message: 'Invalid input detected (XSS protection)' });
    }

    try {
        // 1. Fetch User
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (fetchError || !user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 2. Check Lockout Status
        if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
            const waitTime = Math.ceil((new Date(user.lockout_until) - new Date()) / 60000);
            return res.status(429).json({
                message: `Account locked. Please try again in ${waitTime} minutes.`,
                lockoutUntil: user.lockout_until
            });
        }

        // 3. Verify Password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            // Increment failed attempts
            const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
            let updateData = { failed_login_attempts: newFailedAttempts };

            // Lockout after 5 attempts
            if (newFailedAttempts >= 5) {
                const lockoutTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
                updateData.lockout_until = lockoutTime;
            }

            // Update user record with failure
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

        // 3. Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Update Last Active
        // 5. Update Last Active & Reset Failed Attempts
        await supabase
            .from('users')
            .update({
                last_active: new Date().toISOString(),
                failed_login_attempts: 0,
                lockout_until: null
            })
            .eq('id', user.id);

        return res.status(200).json({ token, user: { username: user.username, email: user.email } });

    } catch (error) {
        console.error('Login API Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
