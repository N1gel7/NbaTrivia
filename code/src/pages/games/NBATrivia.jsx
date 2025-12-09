import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { supabase } from '../../supabaseClient';
import './NBATrivia.css';

function NBATrivia() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'Trivia');

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
    return <div className="loading-screen">Loading Trivia...</div>;
  }

  if (questions.length === 0) {
    return <div className="error-message">No questions found.</div>;
  }

  const handleAnswerSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = index === question.correct;

    if (isCorrect) {
      setScore(score + 1);
      setTotalPoints(totalPoints + question.points);
    }

    setAnswers([
      ...answers,
      {
        question: question.question,
        selected: index,
        correct: question.correct,
        isCorrect,
        points: isCorrect ? question.points : 0,
        difficulty: question.difficulty
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

  const getDifficultyIcons = (difficulty) => {
    return '🏀'.repeat(difficulty);
  };

  const percentage = Math.round((score / questions.length) * 100);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const decodeJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (gameComplete) {
      saveGameStats();
    }
  }, [gameComplete]);

  const saveGameStats = async () => {
    const token = Cookies.get('auth_token');
    if (!token) return;

    const decoded = decodeJwt(token);
    const userId = decoded?.id;
    if (!userId) return;

    try {
      // 1. Update Game Mode Stats for Trivia
      const { data: existing } = await supabase
        .from('user_game_mode_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('game_mode', 'TSrivia')
        .single();

      const currentStreak = (existing?.current_streak || 0);
      const newStreak = score === questions.length ? currentStreak + 1 : 0;

      const newGamesPlayed = (existing?.games_played || 0) + 1;
      const updatedStreak = score >= 5 ? currentStreak + 1 : 0;

      await supabase
        .from('user_game_mode_stats')
        .upsert({
          user_id: userId,
          game_mode: 'trivia',
          games_played: newGamesPlayed,
          current_streak: updatedStreak,
          best_score: Math.max(existing?.best_score || 0, totalPoints)
        }, { onConflict: 'user_id, game_mode' });


      // 2. Update Global Stats
      const { data: global } = await supabase
        .from('user_global_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const totalQuestions = (global?.total_questions || 0) + 10;
      const currentPoints = (global?.total_points || 0) + totalPoints; // Use calculated totalPoints
      const newXp = (global?.xp || 0) + score * 10;

      await supabase
        .from('user_global_stats')
        .upsert({
          user_id: userId,
          total_questions: totalQuestions,
          total_points: currentPoints,
          xp: newXp,
          last_active: new Date().toISOString()
        }, { onConflict: 'user_id' });

    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

  if (gameComplete) {
    return (
      <div className="trivia-game">
        <Navbar onLogout={handleLogout} />
        <div className="game-container">
          <div className="results-screen">
            <h1>Trivia Complete!</h1>
            <div className="results-summary">
              <div className="score-card">
                <div className="score-main">{score}/{questions.length}</div>
                <div className="score-label">Correct Answers</div>
              </div>
              <div className="score-card">
                <div className="score-main">{totalPoints}</div>
                <div className="score-label">Total Points</div>
              </div>
              <div className="score-card">
                <div className="score-main">{percentage}%</div>
                <div className="score-label">Accuracy</div>
              </div>
            </div>

            <div className="questions-review">
              <h2>Question Review</h2>
              {answers.map((answer, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className={`review-icon ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="review-difficulty">
                      {getDifficultyIcons(answer.difficulty)}
                    </div>
                    {answer.isCorrect && (
                      <div className="review-points">+{answer.points} pts</div>
                    )}
                  </div>
                  <div className="review-content">
                    <div className="review-question">{answer.question}</div>
                    <div className={`review-answer ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
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
    <div className="trivia-game">
      <Navbar onLogout={handleLogout} />
      <div className="game-container">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span className="points-display">Points: {totalPoints}</span>
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            <div className="difficulty-badge">
              {getDifficultyIcons(question.difficulty)}
            </div>
            <div className="points-badge">{question.points} points</div>
          </div>

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
              <div className={`feedback-message ${selectedAnswer === question.correct ? 'correct' : 'incorrect'}`}>
                {selectedAnswer === question.correct
                  ? `✓ Correct! +${question.points} points`
                  : '✗ Incorrect'}
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

export default NBATrivia;

