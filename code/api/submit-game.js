
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const JWT_SECRET = process.env.JWT_SECRET;
const DEBUG_SKIP_AUTH = false;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { token, answers, gameMode = 'trivia' } = req.body;
    let userId = null;

    try {
        if (DEBUG_SKIP_AUTH) {
            userId = req.body.userId;
        } else {
            if (!token) throw new Error('No token provided');
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
        }
    } catch (e) {
        return res.status(401).json({ message: 'Unauthorized', error: e.message });
    }


    if (!['mvp_speed', 'guess_player'].includes(gameMode)) {
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'No answers provided' });
        }
    }

    try {
        let calculatedScore = 0;
        let calculatedTotalPoints = 0;


        if (gameMode === 'mvp_speed') {
            // score = number of correct MVP names typed
            calculatedScore = req.body.score || 0;
            calculatedTotalPoints = calculatedScore;
        } else if (gameMode === 'guess_player') {
            // Guess player: points decrease with each clue used
            calculatedScore = req.body.correctGuesses || 0;
            calculatedTotalPoints = req.body.score || 0;
        } else {

            const questionIds = answers.map(a => a.questionId);
            const { data: dbQuestions, error: qError } = await supabase
                .from('questions')
                .select('id, correct, points, difficulty')
                .in('id', questionIds);

            if (qError) throw qError;

            const qMap = {};
            dbQuestions.forEach(q => { qMap[q.id] = q; });

            answers.forEach(ans => {
                const dbQ = qMap[ans.questionId];
                if (dbQ) {
                    if (parseInt(ans.selectedAnswer) === parseInt(dbQ.correct)) {
                        calculatedScore += 1;
                        calculatedTotalPoints += (dbQ.points || 1);
                    }
                }
            });
        }


        const { data: existingModeParams } = await supabase
            .from('user_game_mode_stats')
            .select('games_played, best_score')
            .eq('user_id', userId)
            .eq('game_mode', gameMode)
            .single();

        const currentBest = existingModeParams?.best_score || 0;
        const newGamesPlayed = (existingModeParams?.games_played || 0) + 1;

        await supabase
            .from('user_game_mode_stats')
            .upsert({
                user_id: userId,
                game_mode: gameMode,
                games_played: newGamesPlayed,
                best_score: Math.max(currentBest, calculatedTotalPoints)
            }, { onConflict: 'user_id, game_mode' });

        // Update overall stats (total points, average score, daily streak)
        const { data: globalStats } = await supabase
            .from('user_global_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        const questionsThisGame = gameMode === 'mvp_speed' ? 1 :
            gameMode === 'guess_player' ? (req.body.totalPlayers || 5) :
                answers.length;

        const totalQuestions = (globalStats?.total_questions || 0) + questionsThisGame;
        const currentPoints = (globalStats?.total_points || 0) + calculatedTotalPoints;

        // Calculate percentage score for this game session
        let percentageThisGame;
        if (gameMode === 'mvp_speed') {
            const totalMVPs = req.body.totalMVPs || 1;
            percentageThisGame = Math.round((calculatedScore / totalMVPs) * 100);
        } else if (gameMode === 'guess_player') {
            const totalPlayers = req.body.totalPlayers || 5;
            percentageThisGame = Math.round((calculatedScore / totalPlayers) * 100);
        } else {
            percentageThisGame = Math.round((calculatedScore / answers.length) * 100);
        }


        const previousAvg = globalStats?.avg_score || 0;
        const estGamesPlayed = Math.floor((globalStats?.total_questions || 0) / 10) + 1;
        const newAvgScore = Math.round(((previousAvg * (estGamesPlayed - 1)) + percentageThisGame) / estGamesPlayed);

        // Daily streak: continues if played yesterday, resets if gap > 1 day
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let dailyStreak = 1;

        if (globalStats?.last_played) {
            const lastPlayed = new Date(globalStats.last_played);
            const lastPlayedDate = new Date(lastPlayed.getFullYear(), lastPlayed.getMonth(), lastPlayed.getDate());
            const daysDiff = Math.floor((today - lastPlayedDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day - keep current streak
                dailyStreak = globalStats.daily_streak || 1;
            } else if (daysDiff === 1) {
                // Consecutive day - increment streak
                dailyStreak = (globalStats.daily_streak || 0) + 1;
            }
            // else: gap > 1 day, streak resets to 1
        }

        await supabase
            .from('user_global_stats')
            .upsert({
                user_id: userId,
                total_questions: totalQuestions,
                total_points: currentPoints,
                avg_score: newAvgScore,
                daily_streak: dailyStreak,
                last_played: now.toISOString()
            }, { onConflict: 'user_id' });


        const { error: sessionError } = await supabase
            .from('game_sessions')
            .insert({
                user_id: userId,
                game_mode: gameMode,
                score: calculatedTotalPoints,
                played_at: new Date().toISOString()
            });

        if (sessionError) throw sessionError;

        return res.status(200).json({
            message: 'Game submitted successfully',
            score: calculatedScore,
            totalPoints: calculatedTotalPoints,
            streak: dailyStreak,
            newAvg: newAvgScore
        });

    } catch (error) {
        console.error('Submit Game Error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
