import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { playerClues } from '../../data/mockData';
import './GuessThePlayer.css';

function GuessThePlayer() {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const navigate = useNavigate();

  const [players] = useState(() => {
    return [...playerClues].sort(() => Math.random() - 0.5).slice(0, 5);
  });

  const currentPlayer = players[currentPlayerIndex];
  const currentClue = currentPlayer.clues[currentClueIndex];
  const maxClues = currentPlayer.clues.length;
  const pointsForClue = [500, 400, 300, 200, 100];
  const currentPoints = pointsForClue[currentClueIndex];

  const handleGuess = () => {
    if (!guess.trim()) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPlayer = currentPlayer.player.toLowerCase();

    if (normalizedGuess === normalizedPlayer) {
      const pointsEarned = currentPoints;
      setScore(score + pointsEarned);
      setRevealed(true);
      setGameHistory([
        ...gameHistory,
        {
          player: currentPlayer.player,
          cluesUsed: currentClueIndex + 1,
          points: pointsEarned,
          correct: true
        }
      ]);
    } else {
      alert('Incorrect! Try again or reveal the next clue.');
    }
  };

  const handleNextClue = () => {
    if (currentClueIndex < maxClues - 1) {
      setCurrentClueIndex(currentClueIndex + 1);
    } else {
      setRevealed(true);
      setGameHistory([
        ...gameHistory,
        {
          player: currentPlayer.player,
          cluesUsed: maxClues,
          points: 0,
          correct: false
        }
      ]);
    }
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setCurrentClueIndex(0);
      setGuess('');
      setRevealed(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  if (gameComplete) {
    return (
      <div className="guess-player-game">
        <Navbar onLogout={handleLogout} />
        <div className="game-container">
          <div className="results-screen">
            <h1>Game Complete!</h1>
            <div className="final-score">
              <div className="score-number">{score}</div>
              <div className="score-label">Total Points</div>
            </div>

            <div className="game-history">
              <h2>Your Guesses</h2>
              {gameHistory.map((item, index) => (
                <div key={index} className={`history-item ${item.correct ? 'correct' : 'incorrect'}`}>
                  <div className="history-player">
                    <span className="player-icon">{item.correct ? '✓' : '✗'}</span>
                    <span className="player-name">{item.player}</span>
                  </div>
                  <div className="history-details">
                    <span>Clues used: {item.cluesUsed}/{maxClues}</span>
                    {item.points > 0 && (
                      <span className="history-points">+{item.points} pts</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="game-actions">
              <button
                className="btn btn-orange"
                onClick={() => window.location.reload()}
              >
                Play Again
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guess-player-game">
      <Navbar onLogout={handleLogout} />
      <div className="game-container">
        <div className="game-header">
          <div className="player-counter">
            Player {currentPlayerIndex + 1} of {players.length}
          </div>
          <div className="score-display">
            Score: {score} points
          </div>
        </div>

        <div className="clue-section">
          <div className="clue-number">
            Clue {currentClueIndex + 1} of {maxClues}
          </div>
          <div className="points-available">
            {currentPoints} points available
          </div>

          <div className="clue-card">
            <div className="clue-text">{currentClue}</div>
          </div>

          {!revealed && (
            <div className="guess-section">
              <input
                type="text"
                className="guess-input"
                placeholder="Who am I?"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                autoFocus
              />
              <div className="guess-actions">
                <button className="btn btn-primary" onClick={handleGuess}>
                  Guess Now
                </button>
                <button className="btn btn-secondary" onClick={handleNextClue}>
                  Reveal Next Clue
                </button>
              </div>
            </div>
          )}

          {revealed && (
            <div className="reveal-section">
              <div className="player-reveal">
                <div className="player-icon-large">{currentPlayer.image}</div>
                <div className="player-name-large">{currentPlayer.player}</div>
                <div className="player-stats">{currentPlayer.stats}</div>
              </div>
              <button className="btn btn-orange btn-full" onClick={handleNextPlayer}>
                {currentPlayerIndex < players.length - 1 ? 'Next Player' : 'View Results'}
              </button>
            </div>
          )}
        </div>

        <div className="clues-progress">
          {currentPlayer.clues.map((_, index) => (
            <div
              key={index}
              className={`clue-dot ${index <= currentClueIndex ? 'revealed' : ''}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuessThePlayer;

