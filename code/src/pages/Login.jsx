
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Cookies from 'js-cookie';
import './Login.css';

/**
 * Login Page
 * Handles user authentication, including lockout timer display and role-based redirection.
 */
function Login(props) {
  const onLogin = props.onLogin;

  // 1. STATE
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const navigate = useNavigate();

  // 2. EFFECTS
  /**
   * Lockout Timer Countdown
   * Updates the "Try again in X:XX" text every second if a lockout is active.
   */
  useEffect(() => {
    if (!lockoutEnd) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(lockoutEnd);
      const diff = end - now;

      if (diff <= 0) {
        setLockoutEnd(null);
        setError('');
        setTimeLeft('');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutEnd]);

  // 3. LOGIC
  /**
   * Check if client-side throttle allows login
   * Prevents spamming the submit button locally (1 second cooldown)
   */
  function canLogin() {
    const lastAttempt = localStorage.getItem('last_login_attempt');
    if (lastAttempt === null) return true;

    const now = Date.now();
    const last = parseInt(lastAttempt);
    const timeSince = now - last;

    // 1 second buffer
    return timeSince > 1000;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!canLogin()) {
      setError('Please wait a moment before trying again.');
      return;
    }

    const nowStr = Date.now().toString();
    localStorage.setItem('last_login_attempt', nowStr);
    setLoading(true);

    const bodyData = { username, password };

    // API Call
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
      .then(response => response.json().then(data => ({ ok: response.ok, data })))
      .then(result => {
        // Handle Error / Lockout
        if (!result.ok) {
          if (result.data.lockoutUntil) {
            setLockoutEnd(result.data.lockoutUntil);
          }
          throw new Error(result.data.message || 'Login failed');
        }

        // Handle Success
        const { token, user } = result.data;
        const role = user.role;
        const expiry = 1; // 1 Day

        console.log('Login Successful:', user);

        Cookies.set('auth_token', token, { expires: expiry });
        onLogin(); // Update global auth state

        // Role-Based Redirection
        if (role && role.toLowerCase() === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Login error:', err);
        setError(err.message || 'Failed to login');
        setLoading(false);
      });
  }

  // 4. RENDER HELPERS
  const passwordInputType = showPassword ? 'text' : 'password';
  const passwordIcon = showPassword ? <EyeOff size={18} /> : <Eye size={18} />;
  const buttonText = loading ? 'Logging in...' : 'Sign In';

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-hero">
          <div className="basketball-icon">🏀</div>
          <h1>NBA Trivia</h1>
          <p className="tagline">Test Your NBA Knowledge</p>
          <div className="stats-preview">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5k+</span>
              <span className="stat-label">Questions</span>
            </div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Please enter your details</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={passwordInputType}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {passwordIcon}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>

            {lockoutEnd && (
              <div className="lockout-timer" style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
                Try again in: {timeLeft}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {buttonText}
            </button>
          </form>

          <p className="register-link">
            Don't have an account? <Link to="/register">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
