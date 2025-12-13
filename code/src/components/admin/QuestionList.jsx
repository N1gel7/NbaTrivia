import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

function QuestionList(props) {

    const questions = props.questions;
    const expandedIds = props.expandedIds;
    const handleEdit = props.handleEdit;
    const handleDelete = props.handleDelete;
    const toggleExpand = props.toggleExpand;

    if (questions.length === 0) {
        return (
            <div className="empty-state">
                <p>No questions found matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="questions-list">
            {questions.map((question) => {
                let isExpanded = false;
                if (expandedIds.includes(question.id)) {
                    isExpanded = true;
                }

                let difficultyClass = 'badge-easy';
                if (question.difficulty === 2) {
                    difficultyClass = 'badge-medium';
                } else if (question.difficulty === 3) {
                    difficultyClass = 'badge-hard';
                }

                return (
                    <div key={question.id} className="question-item">
                        <div className="question-main">
                            <div className="question-info">
                                <span className={`difficulty-badge ${difficultyClass}`}>
                                    {question.category || 'Trivia'}
                                </span>
                                <h3 className="question-text">{question.question}</h3>
                            </div>

                            <div className="question-actions">
                                <button
                                    className="btn-icon"
                                    onClick={() => handleEdit(question)}
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    className="btn-icon delete"
                                    onClick={() => handleDelete(question.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={() => toggleExpand(question.id)}
                                >
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Only show details if expanded */}
                        {isExpanded && (
                            <div className="question-details fade-in">
                                <div className="options-grid">
                                    {question.options.map((option, index) => {
                                        // Highlight correct answer
                                        let optionClass = 'option-view';
                                        if (index === question.correct) {
                                            optionClass = 'option-view correct';
                                        }

                                        return (
                                            <div key={index} className={optionClass}>
                                                <span className="option-label">Option {index + 1}:</span>
                                                {option}
                                                {index === question.correct && <span className="correct-tag">✓ Correct</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="meta-info">
                                    <span>Points: {question.points}</span>
                                    <span>Difficulty: {question.difficulty}/3</span>
                                    {question.fact && (
                                        <div className="fact-box">
                                            <strong>Fun Fact:</strong> {question.fact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default QuestionList;
