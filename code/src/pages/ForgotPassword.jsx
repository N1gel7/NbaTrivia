import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import './Login.css'; // Reuse Login styles

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: Security Question
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/get-security-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If user not found, we purposefully simulate success or give generic error
                // based on privacy setting. But for Trivia app context, we'll err on UX.
                // However, without a question, we can't really proceed to step 2 logically.
                // So we might say "Account not found" or handle it delicately.
                // For simplicity/UX:
                throw new Error(data.message || 'Account not found');
            }

            if (data.question) {
                setSecurityQuestion(data.question);
                setStep(2);
            } else {
                throw new Error("No security question set for this account. Please contact support.");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, securityAnswer }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Incorrect answer');
            }

            setMessage('Success! A password reset link has been sent to your email.');
            setStep(3); // 3: Success state

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-hero">
                    <div className="basketball-icon">🏀</div>
                    <h1>NBA Trivia</h1>
                    <p className="tagline">Recover Your Account</p>
                </div>
            </div>
            <div className="login-right">
                <div className="login-card">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <h2>Forgot Password?</h2>

                    {step === 1 && (
                        <>
                            <p className="login-subtitle">
                                Enter your email to begin the recovery process.
                            </p>
                            <form onSubmit={handleEmailSubmit}>
                                <div className="input-group">
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            className="input"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Checking...' : 'Next'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="login-subtitle">
                                Please answer your security question to verify it's you.
                            </p>
                            <div className="security-question-box" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
                                <strong>Question:</strong> {securityQuestion}
                            </div>
                            <form onSubmit={handleAnswerSubmit}>
                                <div className="input-group">
                                    <div className="input-wrapper">
                                        <Key className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Your Answer"
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Send Reset Link'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-full"
                                    style={{ marginTop: '10px' }}
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                            </form>
                        </>
                    )}

                    {step === 3 && (
                        <div className="success-state" style={{ textAlign: 'center' }}>
                            <div style={{ color: 'green', fontSize: '48px', marginBottom: '20px' }}>✓</div>
                            <h3>Email Sent!</h3>
                            <p>{message}</p>
                            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
                                Return to Login
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
