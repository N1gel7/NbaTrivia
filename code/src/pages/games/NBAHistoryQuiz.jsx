import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  async function fetchQuestions() {
    try {
      // Fetch history questions
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'history');

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
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - percentage / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="progress-text">
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
                <div key={index} className={`review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-icon">
                    {answer.isCorrect ? '✓' : '✗'}
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
    <div className="history-quiz-game">
      <Navbar onLogout={handleLogout} />
      <div className="game-container">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
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
              <div className={`feedback-message ${selectedAnswer === question.correct ? 'correct' : 'incorrect'}`}>
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

