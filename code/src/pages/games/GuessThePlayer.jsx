
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import Skeleton from '../../components/Skeleton';
import GameResults from '../../components/game/GameResults';
import GuessHistoryList from '../../components/game/GuessHistoryList';
import { supabase } from '../../supabaseClient';
import { soundManager } from '../../utils/soundManager';
import { celebrateGameComplete } from '../../utils/confetti';
import './GuessThePlayer.css';

function GuessThePlayer() {
  // 1. STATE
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 2. EFFECTS
  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    if (gameComplete) {
      saveGameStats();
      celebrateGameComplete();
    }
  }, [gameComplete]);

  // 3. LOGIC & API
  async function fetchGameData() {
    try {
      const { data, error } = await supabase
        .from('guess_player_questions')
        .select('*');

      if (error) {
        console.error('Error fetching players:', error);
      } else {
        // Randomize
        const shuffled = data.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);

        const formatted = selected.map(p => ({
          player: (p.first_name || '') + ' ' + (p.last_name || ''),
          clues: Array.isArray(p.clues) ? p.clues : [],
          stats: p.stats || 'No stats available'
        }));

        setPlayers(formatted);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const saveGameStats = async () => {
    const token = Cookies.get('auth_token');
    if (!token) return;

    try {
      const correctGuesses = gameHistory.filter(h => h.correct).length;
      await fetch('/api/submit-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          gameMode: 'guess_player',
          score: score,
          correctGuesses: correctGuesses,
          totalPlayers: players.length
        })
      });
    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

  const resetGame = () => {
    setCurrentPlayerIndex(0);
    setCurrentClueIndex(0);
    setGuess('');
    setScore(0);
    setGameComplete(false);
    setRevealed(false);
    setGameHistory([]);
  };

  if (loading) {
    return (
      <div className="guess-player-game">
        <Navbar onLogout={() => { }} />
        <div className="game-container">
          <Skeleton type="title" style={{ width: '100%', height: '300px' }} />
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="guess-player-game">
        <Navbar onLogout={() => navigate('/login')} />
        <div className="game-container">
          <div className="error-message">No players found!</div>
        </div>
      </div>
    );
  }

  // GAME OVER
  if (gameComplete) {
    const correctCount = gameHistory.filter(h => h.correct).length;

    return (
      <div className="guess-player-game">
        <Navbar onLogout={() => navigate('/login')} />
        <div className="game-container">
          <GameResults
            title="Mystery Solved!"
            score={correctCount}
            total={players.length}
            points={score}
            gameMode="guess_player"
            onPlayAgain={resetGame}
          >
            <GuessHistoryList history={gameHistory} maxClues={5} />
          </GameResults>
        </div>
      </div>
    );
  }

  // ACTIVE GAME LOGIC
  const currentPlayer = players[currentPlayerIndex];
  const currentClue = currentPlayer.clues[currentClueIndex];
  const maxClues = currentPlayer.clues.length;
  // Clues are worth less as you go (500 -> 100)
  const pointsForClue = [500, 400, 300, 200, 100];
  const currentPoints = pointsForClue[currentClueIndex];

  const handleGuess = () => {
    if (!guess.trim()) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPlayer = currentPlayer.player.toLowerCase();

    if (normalizedGuess === normalizedPlayer) {
      const pointsEarned = currentPoints;
      soundManager.play('correct');
      setScore(score + pointsEarned);
      setRevealed(true);

      setGameHistory([...gameHistory, {
        player: currentPlayer.player,
        cluesUsed: currentClueIndex + 1,
        points: pointsEarned,
        correct: true
      }]);
    } else {
      soundManager.play('wrong');
      alert('Incorrect! Try again or reveal the next clue.');
    }
  };

  const handleNextClue = () => {
    if (currentClueIndex < maxClues - 1) {
      setCurrentClueIndex(currentClueIndex + 1);
    } else {
      // Out of clues -> fail
      setRevealed(true);
      setGameHistory([...gameHistory, {
        player: currentPlayer.player,
        cluesUsed: maxClues,
        points: 0,
        correct: false
      }]);
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

  // Determine button text helper
  let nextButtonText = 'Next Player';
  if (currentPlayerIndex >= players.length - 1) {
    nextButtonText = 'View Results';
  }

  return (
    <div className="guess-player-game">
      <Navbar onLogout={() => navigate('/login')} />

      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <div className="player-counter">
            Player {currentPlayerIndex + 1} of {players.length}
          </div>
          <div className="score-display">
            Score: {score} points
          </div>
        </div>

        {/* Clue Section */}
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleGuess();
                }}
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
                <div className="player-name-large">{currentPlayer.player}</div>
                <div className="player-stats">{currentPlayer.stats}</div>
              </div>
              <button className="btn btn-orange btn-full" onClick={handleNextPlayer}>
                {nextButtonText}
              </button>
            </div>
          )}
        </div>

        {/* Progress Dots */}
        <div className="clues-progress">
          {currentPlayer.clues.map((_, index) => {
            let dotClass = 'clue-dot';
            if (index <= currentClueIndex) {
              dotClass += ' revealed';
            }

            return (
              <div key={index} className={dotClass}></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GuessThePlayer;
