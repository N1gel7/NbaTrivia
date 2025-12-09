
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

    const { firstName, lastName, username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Check for existing users
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('username, email')
            .or(`username.eq.${username},email.eq.${email}`);

        if (checkError) throw checkError;

        if (existingUsers && existingUsers.length > 0) {
            const taken = existingUsers[0];
            if (taken.username === username) {
                return res.status(409).json({ message: 'Username already taken' });
            } else {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert User
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                first_name: firstName,
                last_name: lastName,
                username,
                email,
                password_hash: hashedPassword
            }]);

        if (insertError) throw insertError;

        return res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration API Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
