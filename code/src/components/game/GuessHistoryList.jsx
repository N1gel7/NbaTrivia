import React from 'react';
import './GuessHistoryList.css';

function GuessHistoryList({ history, maxClues }) {
    if (!history || history.length === 0) return null;

    return (
        <div className="game-history">
            <h2>Your Guesses</h2>
            {history.map((item, index) => {
                let itemClass = 'history-item';
                let icon = '✗';

                if (item.correct) {
                    itemClass += ' correct';
                    icon = '✓';
                } else {
                    itemClass += ' incorrect';
                }

                return (
                    <div key={index} className={itemClass}>
                        <div className="history-player">
                            <span className="player-icon">{icon}</span>
                            <span className="player-name">{item.player}</span>
                        </div>
                        <div className="history-details">
                            <span>Clues used: {item.cluesUsed}/{maxClues}</span>
                            {item.points > 0 && (
                                <span className="history-points">+{item.points} pts</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default GuessHistoryList;
