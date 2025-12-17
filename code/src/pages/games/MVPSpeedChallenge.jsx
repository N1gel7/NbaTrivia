
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { supabase } from '../../supabaseClient';
import Navbar from '../../components/Navbar';
import Skeleton from '../../components/Skeleton';
import GameResults from '../../components/game/GameResults';
import { soundManager } from '../../utils/soundManager';
import { celebrateGameComplete } from '../../utils/confetti';
import './MVPSpeedChallenge.css';

function MVPSpeedChallenge() {
  // 1. STATE
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

  // 2. EFFECTS
  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        endGame();
      }
    }
  }, [gameState, timeLeft]);

  // 3. LOGIC & API
  const fetchGameData = async () => {
    try {
      // Fetch MVP names
      const { data: mvpData, error: mvpError } = await supabase
        .from('mvp_winners')
        .select('first_name, last_name');

      if (mvpError) throw mvpError;

      const names = new Set();
      mvpData.forEach(p => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase().trim().replace(/\s+/g, ' ');
        names.add(fullName);
      });
      setAllMVPs(Array.from(names));

      // Fetch personal best
      const token = Cookies.get('auth_token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          if (decoded?.id) {
            const { data: stats } = await supabase
              .from('user_game_mode_stats')
              .select('best_score')
              .eq('user_id', decoded.id)
              .eq('game_mode', 'mvp_speed')
              .single();

            if (stats) setPersonalBest(stats.best_score);
          }
        } catch (e) { }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching game data:', error);
      setLoading(false);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setScore(0);
    setInput('');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        checkAnswer(input.trim());
        setInput('');
      }
    }
  };

  const checkAnswer = (answer) => {
    const normalizedAnswer = answer.toLowerCase();
    const isCorrect = allMVPs.includes(normalizedAnswer);
    const alreadyAnswered = correctAnswers.includes(normalizedAnswer);

    if (isCorrect && !alreadyAnswered) {
      soundManager.play('correct');
      setCorrectAnswers([...correctAnswers, normalizedAnswer]);
      setScore(score + 1);
    } else {
      if (!isCorrect) {
        soundManager.play('wrong');
        setIncorrectAnswers([...incorrectAnswers, answer]);

        // Shake effect
        if (inputRef.current) {
          inputRef.current.classList.add('shake');
          setTimeout(() => {
            if (inputRef.current) inputRef.current.classList.remove('shake');
          }, 500);
        }
      }
    }
  };

  const endGame = async () => {
    setGameState('post');
    celebrateGameComplete();

    if (score > personalBest) {
      setPersonalBest(score);
    }

    const token = Cookies.get('auth_token');
    if (token) {
      try {
        await fetch('/api/submit-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            gameMode: 'mvp_speed',
            score: score,
            totalMVPs: allMVPs.length
          })
        });
      } catch (err) {
        console.error('Error saving score:', err);
      }
    }
  };

  const resetGame = () => {
    setGameState('pre');
    setTimeLeft(60);
    setInput('');
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setScore(0);
  };

  // 4. RENDER
  if (loading) {
    return (
      <div className="mvp-speed-game">
        <Navbar onLogout={() => { }} />
        <div className="game-container">
          <div className="pre-game-screen">
            <Skeleton type="title" style={{ width: '200px', height: '48px', margin: '0 auto' }} />
          </div>
        </div>
      </div>
    );
  }

  const totalMVPs = allMVPs.length || 1;

  // --- VIEW: POST GAME ---
  if (gameState === 'post') {
    return (
      <div className="mvp-speed-game">
        <Navbar onLogout={() => navigate('/login')} />
        <div className="game-container">
          <GameResults
            title="Time's Up!"
            score={score}
            total={totalMVPs}
            points={score} /* 1 pt per MVP */
            gameMode="mvp_speed"
            onPlayAgain={resetGame}
          >
            {/* Custom Breakdown for Speed Mode */}
            <div className="results-breakdown">
              {score >= personalBest && score > 0 && (
                <div className="new-record">
                  🎉 New Personal Best! 🎉
                </div>
              )}

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
          </GameResults>
        </div>
      </div>
    );
  }

  // --- VIEW: PRE GAME ---
  if (gameState === 'pre') {
    return (
      <div className="mvp-speed-game">
        <Navbar onLogout={() => navigate('/login')} />
        <div className="game-container">
          <div className="pre-game-screen">
            <div className="timer-display-large">
              <div className="timer-number">60</div>
              <div className="timer-label">seconds</div>
            </div>
            <h1 className="ready-heading">Ready?</h1>
            <p className="instructions">
              Type the <strong>FULL NAME</strong> of as many MVP winners as possible.<br />
              (e.g., "Michael Jordan")<br />
              Press Enter after each name.
            </p>
            <button className="btn btn-orange btn-large pulse" onClick={startGame}>
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: PLAYING ---
  // Determine timer class
  let timerClass = 'timer-number';
  if (timeLeft <= 10) {
    timerClass += ' timer-warning';
  }

  return (
    <div className="mvp-speed-game">
      <Navbar onLogout={() => navigate('/login')} />
      <div className="game-container">
        <div className="playing-screen">
          <div className="timer-display">
            <div className={timerClass}>
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
      </div>
    </div>
  );
}

export default MVPSpeedChallenge;
