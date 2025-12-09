
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

        // 2. Verify Password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // 3. Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Update Last Active
        await supabase
            .from('users')
            .update({ last_active: new Date().toISOString() })
            .eq('id', user.id);

        return res.status(200).json({ token, user: { username: user.username, email: user.email } });

    } catch (error) {
        console.error('Login API Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
