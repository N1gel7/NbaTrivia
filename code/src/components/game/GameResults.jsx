import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShareButton from '../ShareButton';
import './GameResults.css';

function GameResults(props) {
    const title = props.title || 'Game Complete!';
    const score = props.score || 0;
    const total = props.total || 0;
    const points = props.points || 0;
    const gameMode = props.gameMode || 'trivia';
    const children = props.children;

    const navigate = useNavigate();

    let accuracy = 0;
    if (total > 0) {
        accuracy = Math.round((score / total) * 100);
    }

    const handlePlayAgain = () => {
        // Map game modes to their routes
        const gameRoutes = {
            'trivia': '/games/nba-trivia',
            'guess_player': '/games/guess-the-player',
            'mvp_speed': '/games/mvp-speed-challenge'
        };

        const route = gameRoutes[gameMode] || '/dashboard';

        // Navigate to the same route, forcing a remount
        navigate(route, { replace: true });

        // Small delay to ensure navigation completes, then navigate again to force remount
        setTimeout(() => {
            navigate(route);
        }, 10);
    };

    return (
        <div className="results-screen fade-in">
            <h1>{title}</h1>

            <div className="results-summary">
                <div className="score-card">
                    <div className="score-main">{score}/{total}</div>
                    <div className="score-label">Score</div>
                </div>
                <div className="score-card">
                    <div className="score-main">{points}</div>
                    <div className="score-label">Points</div>
                </div>
                <div className="score-card">
                    <div className="score-main">{accuracy}%</div>
                    <div className="score-label">Accuracy</div>
                </div>
            </div>


            <div className="results-content">
                {children}
            </div>

            <div className="game-actions">
                <ShareButton
                    score={score}
                    total={total}
                    gameMode={gameMode}
                    points={points}
                />

                <button
                    className="btn btn-orange"
                    onClick={handlePlayAgain}
                >
                    Play Again
                </button>

                <Link to="/dashboard" className="btn btn-secondary">
                    Return Home
                </Link>
            </div>
        </div>
    );
}

export default GameResults;
