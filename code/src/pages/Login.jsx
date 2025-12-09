import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Cookies from 'js-cookie';
import './Login.css';

function Login(props) {
  const onLogin = props.onLogin;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const navigate = useNavigate();

  // Timer Effect
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

  function canLogin() {
    const lastAttempt = localStorage.getItem('last_login_attempt');
    if (lastAttempt === null) {
      return true;
    }

    const now = Date.now();
    const last = parseInt(lastAttempt);
    const timeSince = now - last;

    if (timeSince > 1000) {
      return true;
    } else {
      return false;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (canLogin() === false) {
      setError('Please wait a moment before trying again.');
      return;
    }

    const nowStr = Date.now().toString();
    localStorage.setItem('last_login_attempt', nowStr);

    setLoading(true);

    const bodyData = {
      username: username,
      password: password
    };

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          // We return an object with both response status and data
          const result = {
            ok: response.ok,
            data: data
          };
          return result;
        });
      })
      .then(function (result) {
        if (result.ok === false) {
          const msg = result.data.message;

          let errorMsg = 'Login failed';
          if (msg !== undefined) {
            errorMsg = msg;
          }

          if (result.data.lockoutUntil) {
            setLockoutEnd(result.data.lockoutUntil);
          }

          // Throw simple error string to catch block
          throw new Error(errorMsg);
        }

        const token = result.data.token;

        // Calculate expires
        const expiry = 1;

        Cookies.set('auth_token', token, { expires: expiry });

        onLogin(); // Prop function
        navigate('/dashboard');
        setLoading(false);
      })
      .catch(function (err) {
        console.error('Login error:', err);
        let errMsg = 'Failed to login';
        if (err.message) {
          errMsg = err.message;
        }
        setError(errMsg);
        setLoading(false);
      });
  }

  // Password Input Type logic
  let passwordInputType = 'password';
  if (showPassword === true) {
    passwordInputType = 'text';
  }

  // Password Icon Logic
  let passwordIcon = <Eye size={18} />;
  if (showPassword === true) {
    passwordIcon = <EyeOff size={18} />;
  }

  // Button Text Logic
  let buttonText = 'Sign In';
  if (loading === true) {
    buttonText = 'Logging in...';
  }

  // Error Message Logic
  let errorMessageDiv = null;
  if (error !== '') {
    errorMessageDiv = <div className="error-message">{error}</div>;
  }

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
                  onChange={function (e) { setUsername(e.target.value); }}
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
                  onChange={function (e) { setPassword(e.target.value); }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={function () { setShowPassword(!showPassword); }}
                >
                  {passwordIcon}
                </button>
              </div>
            </div>



            {errorMessageDiv}

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
