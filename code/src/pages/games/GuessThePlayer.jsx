import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
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

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    if (gameComplete) {
      saveGameStats();
    }
  }, [gameComplete]);

  const decodeJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const saveGameStats = async () => {
    const token = Cookies.get('auth_token');
    if (!token) return;

    const decoded = decodeJwt(token);
    const userId = decoded?.id;
    if (!userId) return;

    try {
      // 1. Update Game Mode Stats
      const { data: existing } = await supabase
        .from('user_game_mode_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('game_mode', 'guess_player')
        .single();

      const newGamesPlayed = (existing?.games_played || 0) + 1;
      // Calculate success rate: (total_score / possible_score) * 100? Or just wins? 
      // Let's use score / max possible score logic or just store raw points?

      await supabase
        .from('user_game_mode_stats')
        .upsert({
          user_id: userId,
          game_mode: 'guess_player',
          games_played: newGamesPlayed,
          best_score: Math.max(existing?.best_score || 0, score)
        }, { onConflict: 'user_id, game_mode' });

      // 2. Update Global Stats
      const { data: global } = await supabase
        .from('user_global_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const totalQuestions = (global?.total_questions || 0) + 5; // 5 players
      const currentPoints = (global?.total_points || 0) + score;

      // Calculate average score (score out of 2500 max)
      const percentageThisGame = Math.round((score / 2500) * 100);
      const previousAvg = global?.avg_score || 0;
      const gamesPlayed = Math.floor((global?.total_questions || 0) / 5) + 1;
      const newAvgScore = Math.round(((previousAvg * (gamesPlayed - 1)) + percentageThisGame) / gamesPlayed);

      // Calculate daily streak based on last_played date
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let dailyStreak = 1;
      if (global?.last_played) {
        const lastPlayed = new Date(global.last_played);
        const lastPlayedDate = new Date(lastPlayed.getFullYear(), lastPlayed.getMonth(), lastPlayed.getDate());
        const daysDiff = Math.floor((today - lastPlayedDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          dailyStreak = global.daily_streak || 1;
        } else if (daysDiff === 1) {
          dailyStreak = (global.daily_streak || 0) + 1;
        }
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

      // 3. Save Game Session
      await supabase
        .from('game_sessions')
        .insert({
          user_id: userId,
          game_mode: 'guess_player',
          score: score,
          played_at: new Date().toISOString()
        });

    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

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
        const formatted = selected.map(p => {
          return {
            player: (p.first_name || '') + ' ' + (p.last_name || ''),
            clues: Array.isArray(p.clues) ? p.clues : [],
            stats: p.stats || 'No stats available'
          };
        });

        setPlayers(formatted);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading Game...</div>;
  }

  if (players.length === 0) {
    return <div className="error-message">No players found.</div>;
  }

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
                <div key={index} className={`history - item ${item.correct ? 'correct' : 'incorrect'} `}>
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
              className={`clue - dot ${index <= currentClueIndex ? 'revealed' : ''} `}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuessThePlayer;

