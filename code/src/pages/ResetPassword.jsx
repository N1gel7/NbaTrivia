import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);


    function calculatePasswordStrength(pass) {
        let strength = 0;
        if (pass.length >= 8) strength++;
        const hasLower = /[a-z]/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        const hasDig = /\d/.test(pass);
        const hasSpec = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

        if (hasLower && hasUpper) strength++;
        if (hasDig) strength++;
        if (hasSpec) strength++;
        setPasswordStrength(strength);

        setPasswordCriteria({
            length: pass.length >= 8,
            lower: hasLower,
            upper: hasUpper,
            number: hasDig,
            special: hasSpec
        });
    }

    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false, lower: false, upper: false, number: false, special: false
    });

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        calculatePasswordStrength(val);
    };

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (passwordStrength < 4) {
            setError('Password must be strong: At least 8 characters, with uppercase, lowercase, number, and special character.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setMessage("Password successfully reset! Redirecting to login...");
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-container">
                <div className="login-right" style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
                    <div className="login-card">
                        <h2>Error</h2>
                        <p className="error-message">Invalid reset link.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-hero">
                    <div className="basketball-icon">🏀</div>
                    <h1>NBA Trivia</h1>
                    <p className="tagline">Set New Password</p>
                </div>
            </div>
            <div className="login-right">
                <div className="login-card">
                    <h2>Reset Password</h2>
                    <p className="login-subtitle">Enter your new password below.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>New Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input"
                                    placeholder="New password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {password && (
                                <div className="password-strength" style={{ marginTop: '5px' }}>
                                    <div className="strength-bar" style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${(passwordStrength / 4) * 100}%`,
                                                height: '100%',
                                                background: passwordStrength <= 2 ? 'red' : passwordStrength === 3 ? 'orange' : 'green',
                                                transition: 'all 0.3s'
                                            }}
                                        ></div>
                                    </div>
                                    <div style={{ fontSize: '12px', textAlign: 'right', marginTop: '2px', color: '#666' }}>
                                        {passwordStrength <= 2 ? 'Weak' : passwordStrength === 3 ? 'Medium' : 'Strong'}
                                    </div>
                                </div>
                            )}


                            {password && (
                                <div className="password-requirements" style={{ fontSize: '12px', marginTop: '10px', color: '#666', textAlign: 'left' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px' }}>
                                        <div style={{ color: passwordCriteria.length ? 'green' : '#999' }}>
                                            {passwordCriteria.length ? '✓' : '○'} At least 8 characters
                                        </div>
                                        <div style={{ color: passwordCriteria.upper ? 'green' : '#999' }}>
                                            {passwordCriteria.upper ? '✓' : '○'} Uppercase letter
                                        </div>
                                        <div style={{ color: passwordCriteria.lower ? 'green' : '#999' }}>
                                            {passwordCriteria.lower ? '✓' : '○'} Lowercase letter
                                        </div>
                                        <div style={{ color: passwordCriteria.number ? 'green' : '#999' }}>
                                            {passwordCriteria.number ? '✓' : '○'} Number
                                        </div>
                                        <div style={{ color: passwordCriteria.special ? 'green' : '#999' }}>
                                            {passwordCriteria.special ? '✓' : '○'} Special character (!@#$%)
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {message && <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading ? 'Reseting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
