
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import Skeleton from '../../components/Skeleton';
import GameQuestion from '../../components/game/GameQuestion';
import GameResults from '../../components/game/GameResults';
import QuestionReviewList from '../../components/game/QuestionReviewList';
import { supabase } from '../../supabaseClient';
import { soundManager } from '../../utils/soundManager';
import { celebratePerfectScore, celebrateGameComplete } from '../../utils/confetti';
import './NBATrivia.css';

function NBATrivia() {
  // 1. STATE
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 2. EFFECTS
  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (gameComplete) {
      saveGameStats();

      // Celebrate!
      if (score === questions.length) {
        celebratePerfectScore();
      } else {
        celebrateGameComplete();
      }
    }
  }, [gameComplete]);

  // 3. LOGIC & API
  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'Trivia');

      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        // Shuffle and take 10
        const shuffled = data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 10));
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
      await fetch('/api/submit-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          gameMode: 'trivia',
          answers: answers.map(a => ({
            questionId: a.questionId,
            selectedAnswer: a.selectedAnswer
          }))
        })
      });
    } catch (err) {
      console.error("Error saving stats:", err);
    }
  };

  const handleAnswerSelect = (index) => {
    if (showResult) return; // Prevent multiple clicks

    setSelectedAnswer(index);
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = index === question.correct;

    // Sound
    if (isCorrect) {
      soundManager.play('correct');
      setScore(score + 1);
      setTotalPoints(totalPoints + question.points);
    } else {
      soundManager.play('wrong');
    }

    // Save history
    const newAnswer = {
      questionId: question.id,
      selectedAnswer: index,
      question: question.question,
      selected: index,
      correct: question.correct,
      isCorrect: isCorrect,
      points: isCorrect ? question.points : 0,
      difficulty: question.difficulty
    };

    setAnswers([...answers, newAnswer]);
  };

  const handleNext = () => {
    // Check if it was the last question
    if (currentQuestion >= questions.length - 1) {
      setGameComplete(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // 4. RENDER
  if (loading) {
    // Keep the skeleton for specific page feel, or make a component
    // For now, I'll simplify the skeleton code here to keep file small
    return (
      <div className="trivia-game">
        <Navbar onLogout={() => { }} />
        <div className="game-container">
          <Skeleton type="title" style={{ width: '100%', height: '300px' }} />
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="trivia-game">
        <Navbar onLogout={handleLogout} />
        <div className="game-container">
          <div className="error-message">No questions found!</div>
        </div>
      </div>
    );
  }

  // GAME OVER VIEW
  if (gameComplete) {
    return (
      <div className="trivia-game">
        <Navbar onLogout={handleLogout} />
        <div className="game-container">
          <GameResults
            title="Trivia Complete!"
            score={score}
            total={questions.length}
            points={totalPoints}
            gameMode="trivia"
          >
            <QuestionReviewList answers={answers} />
          </GameResults>
        </div>
      </div>
    );
  }

  // ACTIVE GAME VIEW
  return (
    <div className="trivia-game">
      <Navbar onLogout={handleLogout} />

      <GameQuestion
        question={questions[currentQuestion]}
        currentIndex={currentQuestion}
        total={questions.length}
        score={totalPoints}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        handleAnswerSelect={handleAnswerSelect}
        handleNext={handleNext}
      />
    </div>
  );
}

export default NBATrivia;
