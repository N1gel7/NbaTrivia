
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

    const { firstName, lastName, username, email, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Prevent script injection attacks by blocking common HTML/JS patterns
    const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
    if (
        xssPattern.test(username) ||
        xssPattern.test(email) ||
        xssPattern.test(firstName) ||
        xssPattern.test(lastName) ||
        xssPattern.test(securityQuestion) ||
        xssPattern.test(securityAnswer)
    ) {
        return res.status(400).json({ message: 'Invalid input detected (XSS protection)' });
    }


    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({ message: 'Password is too weak. Must be 8+ chars with uppercase, lowercase, number, and special char.' });
    }

    try {
        // Uniqueness Check
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                first_name: firstName,
                last_name: lastName,
                username,
                email,
                password_hash: hashedPassword,
                security_question: securityQuestion,
                security_answer: securityAnswer
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        // Initialize Stats
        if (newUser) {
            await supabase
                .from('user_global_stats')
                .insert([{
                    user_id: newUser.id,
                    total_points: 0,
                    total_questions: 0,
                    daily_streak: 0,
                    avg_score: 0,
                    hours_played: 0,
                    current_rank: null,
                    last_played: null
                }]);
        }

        return res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration API Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
