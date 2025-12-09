import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { supabase } from '../../supabaseClient';
import Navbar from '../../components/Navbar';
import './MVPSpeedChallenge.css';

function MVPSpeedChallenge() {
  const [gameState, setGameState] = useState('pre');
  const [timeLeft, setTimeLeft] = useState(60);
  const [input, setInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [allMVPs, setAllMVPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGameData();
  }, []);

  const decodeJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const fetchGameData = async () => {
    try {
      // 1. Fetch MVP Names
      const { data: mvpData, error: mvpError } = await supabase
        .from('mvp_winners')
        .select('first_name, last_name');

      if (mvpError) throw mvpError;

      // Construct full names and deduplicate
      const names = new Set();
      mvpData.forEach(p => {
        names.add(`${p.first_name} ${p.last_name}`.toLowerCase());
      });
      setAllMVPs(Array.from(names));

      // 2. Fetch Personal Best
      const token = Cookies.get('auth_token');
      if (token) {
        const decoded = decodeJwt(token);
        if (decoded?.id) {
          const { data: stats } = await supabase
            .from('user_game_mode_stats')
            .select('best_score')
            .eq('user_id', decoded.id)
            .eq('game_mode', 'mvp_speed')
            .single();

          if (stats) setPersonalBest(stats.best_score);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching game data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setScore(0);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e) => {
    const value = e.target.value; // Don't trim while typing
    setInput(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      checkAnswer(input.trim());
      setInput('');
    }
  };

  const checkAnswer = (answer) => {
    const normalizedAnswer = answer.toLowerCase();
    const isCorrect = allMVPs.includes(normalizedAnswer);

    if (isCorrect && !correctAnswers.includes(normalizedAnswer)) {
      setCorrectAnswers([...correctAnswers, normalizedAnswer]);
      setScore(score + 1);
    } else if (!isCorrect) {
      setIncorrectAnswers([...incorrectAnswers, answer]);
      // Shake animation
      if (inputRef.current) {
        inputRef.current.classList.add('shake');
        setTimeout(() => {
          inputRef.current?.classList.remove('shake');
        }, 500);
      }
    }
  };

  const endGame = async () => {
    setGameState('post');
    if (score > personalBest) {
      setPersonalBest(score);

      // Save new record
      const token = Cookies.get('auth_token');
      if (token) {
        const decoded = jwt.decode(token);
        try {
          // Check if row exists first (upsert logic in Supabase via conflict)
          await supabase
            .from('user_game_mode_stats')
            .upsert({
              user_id: decoded.id,
              game_mode: 'mvp_speed',
              best_score: score,
              games_played: 1, // Start logic usually increments this, simplified here
              // current_streak... logic omitted for simplicity
            }, { onConflict: 'user_id, game_mode' });

        } catch (err) {
          console.error('Error saving score:', err);
        }
      }
    }
  };

  const handleLogout = () => {
    Cookies.remove('auth_token');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading-screen">Loading Game Data...</div>;
  }

  const totalMVPs = allMVPs.length || 1; // avoid divide by zero
  const percentage = Math.round((score / totalMVPs) * 100);

  return (
    <div className="mvp-speed-game">
      <Navbar onLogout={handleLogout} />

      <div className="game-container">
        {gameState === 'pre' && (
          <div className="pre-game-screen">
            <div className="timer-display-large">
              <div className="timer-number">60</div>
              <div className="timer-label">seconds</div>
            </div>
            <h1 className="ready-heading">Ready?</h1>
            <p className="instructions">
              Type as many MVP winners as you can remember.<br />
              Press Enter after each name.
            </p>
            <button className="btn btn-orange btn-large pulse" onClick={startGame}>
              Start Challenge
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="playing-screen">
            <div className="timer-display">
              <div className={`timer-number ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
                {timeLeft}
              </div>
              <div className="timer-label">seconds left</div>
            </div>

            <div className="input-section">
              <input
                ref={inputRef}
                type="text"
                className="game-input"
                placeholder="Type MVP name and press Enter..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>

            <div className="score-display">
              <div className="score-value">{score}</div>
              <div className="score-label">MVPs Named</div>
            </div>

            <div className="correct-answers">
              {correctAnswers.map((answer, index) => (
                <div key={index} className="answer-chip correct">
                  ✓ {answer}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'post' && (
          <div className="post-game-screen">
            <h1 className="time-up">Time's Up!</h1>
            <div className="final-score">
              <div className="score-number">{score}</div>
              <div className="score-text">MVPs Named!</div>
            </div>
            <div className="score-percentage">
              That's {percentage}% of all unique MVPs
            </div>

            {score >= personalBest && score > 0 && (
              <div className="new-record">
                🎉 New Personal Best! 🎉
              </div>
            )}

            <div className="results-breakdown">
              <div className="breakdown-section">
                <h3>Correct Answers ({score})</h3>
                <div className="answers-list">
                  {correctAnswers.map((answer, index) => (
                    <span key={index} className="answer-tag correct-tag">
                      {answer}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="game-actions">
              <button className="btn btn-orange" onClick={startGame}>
                Try Again
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MVPSpeedChallenge;

