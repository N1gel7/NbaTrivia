import { Save, X } from 'lucide-react';
import React from 'react';

function QuestionForm(props) {

    const formData = props.formData;
    const setFormData = props.setFormData;
    const isEditing = props.isEditing;
    const handleSave = props.handleSave;
    const handleClose = props.handleClose;


    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        const newData = { ...formData };
        newData[name] = value;
        setFormData(newData);
    };


    let titleText = 'Add New Question';
    if (isEditing) {
        titleText = 'Edit Question';
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content fade-in">
                <div className="modal-header">
                    <h2>{titleText}</h2>
                    <button className="btn-icon" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Question Text</label>
                        <textarea
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            placeholder="Enter the question here..."
                            rows="3"
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Option 1 (Correct Answer if index is 0)</label>
                            <input
                                type="text"
                                name="option0"
                                value={formData.option0}
                                onChange={handleChange}
                                placeholder="Answer Option 1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Option 2</label>
                            <input
                                type="text"
                                name="option1"
                                value={formData.option1}
                                onChange={handleChange}
                                placeholder="Answer Option 2"
                            />
                        </div>
                        <div className="form-group">
                            <label>Option 3</label>
                            <input
                                type="text"
                                name="option2"
                                value={formData.option2}
                                onChange={handleChange}
                                placeholder="Answer Option 3"
                            />
                        </div>
                        <div className="form-group">
                            <label>Option 4</label>
                            <input
                                type="text"
                                name="option3"
                                value={formData.option3}
                                onChange={handleChange}
                                placeholder="Answer Option 4"
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Correct Answer (0-3)</label>
                            <select
                                name="correct"
                                value={formData.correct}
                                onChange={handleChange}
                            >
                                <option value="0">Option 1</option>
                                <option value="1">Option 2</option>
                                <option value="2">Option 3</option>
                                <option value="3">Option 4</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Trivia">Trivia</option>
                                <option value="History">History</option>
                                <option value="Records">Records</option>
                                <option value="General">General</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Difficulty</label>
                            <select
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleChange}
                            >
                                <option value="1">Easy (1)</option>
                                <option value="2">Medium (2)</option>
                                <option value="3">Hard (3)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Points</label>
                            <input
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Did You Know? (Fun Fact)</label>
                        <textarea
                            name="fact"
                            value={formData.fact}
                            onChange={handleChange}
                            placeholder="Add a fun fact to display after answering..."
                            rows="2"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={18} style={{ marginRight: '8px' }} />
                        Save Question
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionForm;
