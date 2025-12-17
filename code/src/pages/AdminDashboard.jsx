import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { PlusCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import './Dashboard.css';

function AdminDashboard() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        question: '',
        option0: '',
        option1: '',
        option2: '',
        option3: '',
        correct: 0,
        difficulty: 1,
        points: 10,
        category: 'Trivia',
        fact: ''
    });

    const [filterCategory, setFilterCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [expandedIds, setExpandedIds] = useState([]);

    const fetchQuestions = async () => {
        try {
            const token = Cookies.get('auth_token');
            const response = await fetch('/api/questions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const result = await response.json();
            setQuestions(result.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching questions:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const toggleExpand = (id) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        );
    };

    const filteredQuestions = () => {
        let result = [...questions];

        if (filterCategory !== 'All') {
            result = result.filter(q => q.category === filterCategory);
        }

        if (searchQuery) {
            result = result.filter(q =>
                q.question.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortBy === 'newest') {
            result.sort((a, b) => b.id - a.id);
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => a.id - b.id);
        } else if (sortBy === 'difficulty') {
            result.sort((a, b) => b.difficulty - a.difficulty);
        }

        return result;
    };

    const displayedQuestions = () => {
        const filtered = filteredQuestions();
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };

    const totalPages = () => {
        return Math.ceil(filteredQuestions().length / itemsPerPage);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages()) {
            setCurrentPage(newPage);
        }
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            question: '',
            option0: '',
            option1: '',
            option2: '',
            option3: '',
            correct: 0,
            difficulty: 1,
            points: 10,
            category: 'Trivia',
            fact: ''
        });
        setShowModal(true);
    };

    const handleEdit = (q) => {
        setIsEditing(true);
        setEditId(q.id);
        setFormData({
            question: q.question,
            option0: q.options[0],
            option1: q.options[1],
            option2: q.options[2],
            option3: q.options[3],
            correct: q.correct,
            difficulty: q.difficulty,
            points: q.points,
            category: q.category,
            fact: q.fact || ''
        });
        setShowModal(true);
    };

    const handleCancelModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
    };

    const handleSave = async () => {
        try {
            const token = Cookies.get('auth_token');
            const options = [formData.option0, formData.option1, formData.option2, formData.option3];

            const payload = {
                question: formData.question,
                options: options,
                answer: formData.correct,
                difficulty: formData.difficulty,
                points: formData.points,
                category: formData.category,
                fact: formData.fact
            };

            let url = '/api/questions';
            let method = 'POST';

            if (isEditing && editId) {
                url = `/api/questions?id=${editId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to save question');
            }

            await fetchQuestions();
            handleCancelModal();
        } catch (err) {
            console.error('Error saving question:', err);
            alert('Failed to save question');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            const token = Cookies.get('auth_token');
            const response = await fetch(`/api/questions?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete question');
            }

            await fetchQuestions();
        } catch (err) {
            console.error('Error deleting question:', err);
            alert('Failed to delete question');
        }
    };

    const handleLogout = () => {
        Cookies.remove('auth_token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
                <Navbar onLogout={handleLogout} />
                <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    <Skeleton type="title" />
                    <div style={{ marginTop: '2rem' }}>
                        <Skeleton type="card" />
                        <Skeleton type="card" style={{ marginTop: '1rem' }} />
                    </div>
                </div>
            </div>
        );
    }

    const stats = {
        total: questions.length,
        easy: questions.filter(q => q.difficulty === 1).length,
        medium: questions.filter(q => q.difficulty === 2).length,
        hard: questions.filter(q => q.difficulty === 3).length
    };

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar onLogout={handleLogout} />

            <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Question Management
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Create and manage trivia questions
                    </p>
                </div>

                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1d428a' }}>{stats.total}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Total Questions</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{stats.easy}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Easy</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{stats.medium}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Medium</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{stats.hard}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Hard</div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="difficulty">By Difficulty</option>
                    </select>
                    <button
                        onClick={handleAddNew}
                        style={{
                            padding: '0.875rem 1.75rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#1d428a',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(29, 66, 138, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(29, 66, 138, 0.4)';
                            e.target.style.background = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(29, 66, 138, 0.3)';
                            e.target.style.background = '#1d428a';
                        }}
                    >
                        <PlusCircle size={20} />
                        Add Question
                    </button>
                </div>

                {/* Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                        backdropFilter: 'blur(4px)'
                    }} onClick={handleCancelModal}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }} onClick={(e) => e.stopPropagation()}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
                                {isEditing ? 'Edit Question' : 'Add New Question'}
                            </h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Question</label>
                                <textarea
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="Enter question"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        background: '#f9fafb',
                                        color: '#1f2937',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Options</label>
                                {[0, 1, 2, 3].map(i => (
                                    <input
                                        key={i}
                                        type="text"
                                        value={formData[`option${i}`]}
                                        onChange={(e) => setFormData({ ...formData, [`option${i}`]: e.target.value })}
                                        placeholder={`Option ${i + 1}`}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            background: '#f9fafb',
                                            color: '#1f2937',
                                            fontSize: '0.95rem',
                                            marginBottom: '0.5rem'
                                        }}
                                    />
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Correct Answer</label>
                                    <select
                                        value={formData.correct}
                                        onChange={(e) => setFormData({ ...formData, correct: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            background: '#f9fafb',
                                            color: '#1f2937',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value={0}>Option 1</option>
                                        <option value={1}>Option 2</option>
                                        <option value={2}>Option 3</option>
                                        <option value={3}>Option 4</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            background: '#f9fafb',
                                            color: '#1f2937',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value={1}>Easy</option>
                                        <option value={2}>Medium</option>
                                        <option value={3}>Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            background: '#f9fafb',
                                            color: '#1f2937',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            background: '#f9fafb',
                                            color: '#1f2937',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="Trivia">Trivia</option>
                                        <option value="History">History</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>Fun Fact (Optional)</label>
                                <textarea
                                    value={formData.fact}
                                    onChange={(e) => setFormData({ ...formData, fact: e.target.value })}
                                    placeholder="Add an interesting fact"
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e5e7eb',
                                        background: '#f9fafb',
                                        color: '#1f2937',
                                        fontSize: '0.95rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleCancelModal}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: '2px solid #d1d5db',
                                        background: 'white',
                                        color: '#374151',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#f3f4f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'white';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#1d428a',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#2563eb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = '#1d428a';
                                    }}
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    background: 'var(--card-bg)',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                }}>
                    {['All', 'Trivia', 'History'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: filterCategory === cat ? '#1d428a' : 'transparent',
                                color: filterCategory === cat ? 'white' : 'var(--text-primary)',
                                fontSize: '0.95rem',
                                fontWeight: filterCategory === cat ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: filterCategory === cat ? '0 4px 12px rgba(29, 66, 138, 0.3)' : 'none',
                                transform: 'translateY(0)'
                            }}
                            onMouseEnter={(e) => {
                                if (filterCategory !== cat) {
                                    e.target.style.background = 'rgba(29, 66, 138, 0.1)';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(29, 66, 138, 0.15)';
                                } else {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(29, 66, 138, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filterCategory !== cat) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                } else {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(29, 66, 138, 0.3)';
                                }
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {displayedQuestions().map(q => (
                        <div key={q.id} style={{
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden'
                        }}>
                            <div
                                onClick={() => toggleExpand(q.id)}
                                style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {q.difficulty === 1 ? '🏀' : q.difficulty === 2 ? '🏀🏀' : '🏀🏀🏀'}
                                    </span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{q.question}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(q); }}
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#1d428a',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#2563eb';
                                            e.target.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = '#1d428a';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#dc2626',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = '#ef4444';
                                            e.target.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = '#dc2626';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {expandedIds.includes(q.id) && (
                                <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {q.options.map((opt, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    background: idx === q.correct ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary)',
                                                    border: `1px solid ${idx === q.correct ? '#10b981' : 'var(--border-color)'}`,
                                                    color: 'var(--text-primary)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span>{opt}</span>
                                                {idx === q.correct && <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Correct</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span>Category: <strong>{q.category}</strong></span>
                                        <span>Points: <strong>{q.points}</strong></span>
                                    </div>
                                    {q.fact && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            background: 'var(--bg-primary)',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Fun Fact:</strong> {q.fact}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages() > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '2rem'
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                opacity: currentPage === 1 ? 0.5 : 1
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span style={{ color: 'var(--text-primary)' }}>
                            Page {currentPage} of {totalPages()}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages()}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                cursor: currentPage === totalPages() ? 'not-allowed' : 'pointer',
                                opacity: currentPage === totalPages() ? 0.5 : 1
                            }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
