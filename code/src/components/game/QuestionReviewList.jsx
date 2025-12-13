import React from 'react';
import './QuestionReviewList.css';

function QuestionReviewList({ answers }) {
    if (!answers || answers.length === 0) {
        return null;
    }

    const getDifficultyIcons = (level) => {
        let stars = '';
        if (level === 1) stars = '🏀';
        if (level === 2) stars = '🏀🏀';
        if (level === 3) stars = '🏀🏀🏀';
        return stars;
    };

    return (
        <div className="questions-review">
            <h2>Question Review</h2>
            {answers.map((answer, index) => {
                let iconClass = 'review-icon';
                let answerClass = 'review-answer';
                let iconSymbol = '✗';
                let answerText = 'Incorrect';

                if (answer.isCorrect) {
                    iconClass += ' correct';
                    answerClass += ' correct';
                    iconSymbol = '✓';
                    answerText = 'Correct!';
                } else {
                    iconClass += ' incorrect';
                    answerClass += ' incorrect';
                }

                return (
                    <div key={index} className="review-item">
                        <div className="review-header">
                            <div className={iconClass}>{iconSymbol}</div>
                            <div className="review-difficulty">
                                {getDifficultyIcons(answer.difficulty)}
                            </div>
                            {answer.isCorrect && (
                                <div className="review-points">+{answer.points} pts</div>
                            )}
                        </div>
                        <div className="review-content">
                            <div className="review-question">{answer.question}</div>
                            <div className={answerClass}>{answerText}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default QuestionReviewList;
