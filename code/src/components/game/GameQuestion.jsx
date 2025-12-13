import React from 'react';
import './GameQuestion.css';

function GameQuestion(props) {
    const question = props.question;
    const currentIndex = props.currentIndex;
    const total = props.total;
    const score = props.score;
    const selectedAnswer = props.selectedAnswer;
    const showResult = props.showResult;
    const handleAnswerSelect = props.handleAnswerSelect;
    const handleNext = props.handleNext;


    const getDifficultyIcons = (level) => {
        let stars = '';
        if (level === 1) stars = '🏀';
        if (level === 2) stars = '🏀🏀';
        if (level === 3) stars = '🏀🏀🏀';
        return stars;
    };

    // Helper for button class logic
    const getButtonClass = (index) => {
        let className = 'answer-button';

        if (showResult) {
            // Game is showing results
            if (index === question.correct) {
                return className + ' correct';
            }
            if (index === selectedAnswer && index !== question.correct) {
                return className + ' incorrect';
            }
        } else {
            // Game is in selection mode
            if (index === selectedAnswer) {
                return className + ' selected';
            }
        }

        return className;
    };

    // Helper for next button text
    let nextButtonText = 'Next Question';
    if (currentIndex >= total - 1) {
        nextButtonText = 'View Results';
    }

    // Helper for feedback message
    let feedbackMessage = '';
    let feedbackClass = '';
    if (showResult) {
        if (selectedAnswer === question.correct) {
            feedbackMessage = `✓ Correct! +${question.points} points`;
            feedbackClass = 'feedback-message correct';
        } else {
            feedbackMessage = '✗ Incorrect';
            feedbackClass = 'feedback-message incorrect';
        }
    }

    // Calculate progress
    const progressPercent = ((currentIndex + 1) / total) * 100;

    return (
        <div className="game-container fade-in">
            {/* Progress Header */}
            <div className="progress-bar-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="progress-info">
                    <span>Question {currentIndex + 1} of {total}</span>
                    <span className="points-display">Points: {score}</span>
                </div>
            </div>

            {/* Question Card */}
            <div className="question-card">
                <div className="question-header">
                    <div className="difficulty-badge">
                        {getDifficultyIcons(question.difficulty)}
                    </div>
                    <div className="points-badge">{question.points} points</div>
                </div>

                <h2 className="question-text">{question.question}</h2>

                <div className="answers-grid">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            className={getButtonClass(index)}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={showResult}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {/* Result Feedback Area */}
                {showResult && (
                    <div className="result-feedback fade-in">
                        <div className={feedbackClass}>
                            {feedbackMessage}
                        </div>

                        {/* Show Fun Fact if available */}
                        {question.fact && (
                            <div className="fun-fact-box">
                                <strong>Did You Know?</strong> {question.fact}
                            </div>
                        )}

                        <button className="btn btn-primary btn-full" onClick={handleNext}>
                            {nextButtonText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameQuestion;
