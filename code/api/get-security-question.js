
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }


    const xssPattern = /(<script)|(<iframe)|(<object)|(<embed)|(<link)|(on\w+\s*=)|(javascript:)|(vbscript:)/i;
    if (xssPattern.test(email)) {
        return res.status(400).json({ message: 'Invalid input detected (XSS protection)' });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('security_question')
            .eq('email', email)
            .single();

        if (error || !user) {
            // In a strict security context, we shouldn't reveal this.
            // But for this app's logic requirement, we must.
            return res.status(404).json({ message: 'Account not found' });
        }

        if (!user.security_question) {
            return res.status(400).json({ message: 'No security question set for this account.' });
        }

        return res.status(200).json({ question: user.security_question });

    } catch (error) {
        console.error('Error fetching question:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
