import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import './NBAHistoryQuiz.css';

function NBAHistoryQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
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
        .eq('game_mode', 'history')
        .single();

      const newGamesPlayed = (existing?.games_played || 0) + 1;
      // You could track accuracy here if db supports it, for now just basic usage

      await supabase
        .from('user_game_mode_stats')
        .upsert({
          user_id: userId,
          game_mode: 'history',
          games_played: newGamesPlayed,
          best_score: Math.max(existing?.best_score || 0, score)
        }, { onConflict: 'user_id, game_mode' });


      // 2. Update Global Stats
      const { data: global } = await supabase
        .from('user_global_stats')
        .select('*')
        .eq('user_id', userId)
        .single();


      const totalQuestions = (global?.total_questions || 0) + 10;
      const currentPoints = (global?.total_points || 0) + (score * 100);

      // Calculate average score (percentage based on correct answers)
      const percentageThisGame = Math.round((score / 10) * 100); // score out of 10 questions
      const previousAvg = global?.avg_score || 0;
      const gamesPlayed = Math.floor((global?.total_questions || 0) / 10) + 1;
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
          game_mode: 'history',
          score: score * 100,
          played_at: new Date().toISOString()
        });

    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

  async function fetchQuestions() {
    try {
      // Fetch history questions
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'History');

      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        const shuffled = data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 10));
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading Quiz...</div>;
  }

  if (questions.length === 0) {
    return <div className="error-message">No questions found.</div>;
  }

  const handleAnswerSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([
      ...answers,
      {
        question: questions[currentQuestion].question,
        selected: index,
        correct: questions[currentQuestion].correct,
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const percentage = Math.round((score / questions.length) * 100);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameComplete) {
    return (
      <div className="history-quiz-game">
        <Navbar onLogout={handleLogout} />
        <div className="game-container">
          <div className="results-screen">
            <h1>Quiz Complete!</h1>
            <div className="results-summary">
              <div className="circular-progress">
                <div className="progress-circle">
                  <svg width="200" height="200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="var(--light-gray)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 90} `}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - percentage / 100)} `}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="circular-progress-text">
                    <div className="progress-percentage">{percentage}%</div>
                    <div className="progress-label">Correct</div>
                  </div>
                </div>
              </div>
              <div className="score-details">
                <div className="score-item">
                  <span className="score-label">Score:</span>
                  <span className="score-value">{score}/{questions.length}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Points Earned:</span>
                  <span className="score-value">{score * 100}</span>
                </div>
              </div>
            </div>

            <div className="questions-review">
              <h2>Question Review</h2>
              {answers.map((answer, index) => (
                <div key={index} className={`review - item ${answer.isCorrect ? 'correct' : 'incorrect'} `}>
                  <div className="review-icon">
                    {answer.isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="review-content">
                    <div className="review-question">{answer.question}</div>
                    <div className={`review - answer ${answer.isCorrect ? 'correct' : 'incorrect'} `}>
                      {answer.isCorrect ? 'Correct!' : 'Incorrect'}
                    </div>
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

  const question = questions[currentQuestion];

  return (
    <div className="history-quiz-game">
      <Navbar onLogout={handleLogout} />
      <div className="game-container">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}% ` }}
            ></div>
          </div>
          <div className="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div className="question-card">
          <h2 className="question-text">{question.question}</h2>

          <div className="answers-grid">
            {question.options.map((option, index) => {
              let buttonClass = 'answer-button';
              if (showResult) {
                if (index === question.correct) {
                  buttonClass += ' correct';
                } else if (index === selectedAnswer && index !== question.correct) {
                  buttonClass += ' incorrect';
                }
              } else if (index === selectedAnswer) {
                buttonClass += ' selected';
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="result-feedback">
              <div className={`feedback - message ${selectedAnswer === question.correct ? 'correct' : 'incorrect'} `}>
                {selectedAnswer === question.correct ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="fact-box">
                <strong>Did you know?</strong> {question.fact}
              </div>
              <button className="btn btn-primary btn-full" onClick={handleNext}>
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NBAHistoryQuiz;

