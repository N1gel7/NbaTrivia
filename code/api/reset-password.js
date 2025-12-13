
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Prevent script injection attacks by blocking common HTML/JS patterns
    const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
    if (xssPattern.test(token)) {
        return res.status(400).json({ message: 'Invalid input detected ' });
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Password is too weak. Must be 8+ chars with uppercase, lowercase, number, and special char.' });
    }

    try {
        // Validate Reset Token
        const { data: resetRecord, error: fetchError } = await supabase
            .from('password_resets')
            .select('*')
            .eq('token', token)
            .single();

        if (fetchError || !resetRecord) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Token expired' });
        }

        // Securely Hash New Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', resetRecord.user_id);

        if (updateError) throw updateError;

        // Invalidate used token and all other tokens for this user
        await supabase
            .from('password_resets')
            .delete()
            .eq('user_id', resetRecord.user_id);

        return res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
