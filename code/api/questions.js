//This portion of code is for the admin
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;
const DEBUG_SKIP_AUTH = false;


export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    let userId = null;
    try {
        if (DEBUG_SKIP_AUTH) {
            userId = 'debug-user-id';
        } else {
            // Check Auth Headers
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) throw new Error('No token provided');
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;

            //Role Verification
            if (decoded.role?.trim().toLowerCase() !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: Admins only' });
            }
        }
    } catch (e) {
        return res.status(401).json({ message: 'Unauthorized', error: e.message });
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getQuestions(req, res);
            case 'POST':
                return await createQuestion(req, res);
            case 'PUT':
                return await updateQuestion(req, res);
            case 'DELETE':
                return await deleteQuestion(req, res);
            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

// Fetch questions 
async function getQuestions(req, res) {
    const { id, limit = 50, offset = 0 } = req.query;

    if (id) {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Question not found' });
        return res.status(200).json(data);
    }


    const { data, error, count } = await supabase
        .from('questions')
        .select('*', { count: 'exact' })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
        .order('id', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
        data,
        pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        }
    });
}

// Create new question
async function createQuestion(req, res) {
    const { question, options, answer, difficulty, points, category, fact } = req.body;

    if (!question || !options || answer === undefined) {
        return res.status(400).json({ message: 'Missing required fields: question, options, answer' });
    }

    const { data, error } = await supabase
        .from('questions')
        .insert({
            question,
            options,
            correct: answer,
            difficulty: difficulty || 'easy',
            points: points || 1,
            category: category || 'Trivia',
            fact: fact || null
        })
        .select()
        .single();

    if (error) throw error;
    return res.status(201).json({ message: 'Question created', data });
}

// Update existing question 
async function updateQuestion(req, res) {
    const { id } = req.query;
    const { question, options, answer, difficulty, points, category, fact } = req.body;

    if (!id) return res.status(400).json({ message: 'Question ID is required' });

    // Only update fields present in payload
    const updates = {};
    if (question !== undefined) updates.question = question;
    if (options !== undefined) updates.options = options;
    if (answer !== undefined) updates.correct = answer;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (points !== undefined) updates.points = points;
    if (category !== undefined) updates.category = category;
    if (fact !== undefined) updates.fact = fact;

    const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Question not found or no changes made' });

    return res.status(200).json({ message: 'Question updated', data });
}

async function deleteQuestion(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Question ID is required' });

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ message: 'Question deleted' });
}
