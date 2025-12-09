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
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase().trim().replace(/\s+/g, ' ');
        names.add(fullName);
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
    const value = e.target.value;
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

    const token = Cookies.get('auth_token');
    if (token) {
      const decoded = decodeJwt(token);
      try {
        // 1. Update Game Mode Stats
        const { data: existing } = await supabase
          .from('user_game_mode_stats')
          .select('*')
          .eq('user_id', decoded.id)
          .eq('game_mode', 'mvp_speed')
          .single();

        const newGamesPlayed = (existing?.games_played || 0) + 1;
        const newBestScore = Math.max(existing?.best_score || 0, score);

        if (score > personalBest) {
          setPersonalBest(score);
        }

        await supabase
          .from('user_game_mode_stats')
          .upsert({
            user_id: decoded.id,
            game_mode: 'mvp_speed',
            best_score: newBestScore,
            games_played: newGamesPlayed,
          }, { onConflict: 'user_id, game_mode' });

        // 2. Update Global Stats
        const { data: global } = await supabase
          .from('user_global_stats')
          .select('*')
          .eq('user_id', decoded.id)
          .single();

        const totalQuestions = (global?.total_questions || 0) + 1; // 1 game session
        const currentPoints = (global?.total_points || 0) + score;

        // Calculate average score (MVP count as percentage of total possible)
        const totalMVPs = allMVPs.length || 1;
        const percentageThisGame = Math.round((score / totalMVPs) * 100);
        const previousAvg = global?.avg_score || 0;
        const gamesPlayed = (global?.total_questions || 0) + 1;
        const newAvgScore = Math.round(((previousAvg * (gamesPlayed - 1)) + percentageThisGame) / gamesPlayed);

        // Calculate daily streak
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
            user_id: decoded.id,
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
            user_id: decoded.id,
            game_mode: 'mvp_speed',
            score: score,
            played_at: new Date().toISOString()
          });



      } catch (err) {
        console.error('Error saving score:', err);
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
              Type the <strong>FULL NAME</strong> of as many MVP winners as you can remember.<br />
              (e.g., "Michael Jordan", not just "Jordan")<br />
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
              <div className="score-value">{score} / {totalMVPs}</div>
              <div className="score-label">Unique MVPs Found</div>
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
            <div className="stat-box">
              <div className="stat-label">Progress</div>
              <div className="stat-value">{score} / {totalMVPs}</div>
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

