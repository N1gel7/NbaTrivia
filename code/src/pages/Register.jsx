import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, Eye, EyeOff } from 'lucide-react';
import './Register.css';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function calculatePasswordStrength(pass) {
    let strength = 0;

    // Manual length check
    if (pass.length >= 8) {
      strength = strength + 1;
    }

    // Simple regex checks are allowed in JS but user asked to avoid "Regular Expressions" 
    // "Do not use regular expressions - use indexOf, substring, and simple string methods instead."
    // We will do simple character loop check for mix of case/number

    let hasLower = false;
    let hasUpper = false;
    let hasDig = false;
    let hasSpec = false;

    const specialChars = "!@#$%^&*(),.?\":{}|<>";
    const numbers = "0123456789";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < pass.length; i = i + 1) {
      const char = pass[i];
      if (lowerChars.indexOf(char) !== -1) {
        hasLower = true;
      }
      if (upperChars.indexOf(char) !== -1) {
        hasUpper = true;
      }
      if (numbers.indexOf(char) !== -1) {
        hasDig = true;
      }
      if (specialChars.indexOf(char) !== -1) {
        hasSpec = true;
      }
    }

    if (hasLower === true) {
      if (hasUpper === true) {
        strength = strength + 1;
      }
    }

    if (hasDig === true) {
      strength = strength + 1;
    }

    if (hasSpec === true) {
      strength = strength + 1;
    }

    setPasswordStrength(strength);
  }

  function handleFirstNameChange(e) {
    setFirstName(e.target.value);
  }

  function handleLastNameChange(e) {
    setLastName(e.target.value);
  }

  function handleUsernameChange(e) {
    setUsername(e.target.value);
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    const val = e.target.value;
    setPassword(val);
    calculatePasswordStrength(val);
  }

  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
  }

  function handleTermsChange(e) {
    setTermsAccepted(e.target.checked);
  }

  function getStrengthLabel() {
    if (passwordStrength === 0) {
      return { label: '', color: '' };
    }
    if (passwordStrength <= 2) {
      return { label: 'Weak', color: 'red' };
    }
    if (passwordStrength === 3) {
      return { label: 'Medium', color: 'orange' };
    }
    return { label: 'Strong', color: 'green' };
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (termsAccepted === false) {
      alert('Please accept the Terms & Conditions');
      return;
    }

    setLoading(true);

    const postData = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok === false) {
          let errorMsg = 'Registration failed';
          if (result.data.message !== undefined) {
            errorMsg = result.data.message;
          }
          throw new Error(errorMsg);
        }

        alert('Registration successful! Please login.');
        navigate('/login');
        setLoading(false);
      })
      .catch(function (err) {
        console.error('Registration Error:', err);
        alert('Error registering user: ' + err.message);
        setLoading(false);
      });
  }

  const strengthObj = getStrengthLabel();
  const strengthLabel = strengthObj.label;
  const strengthColor = strengthObj.color;

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

  // Calculate width string manually for style
  const widthVal = (passwordStrength / 4) * 100;
  const widthStyle = { width: widthVal + '%' };

  let passwordStrengthDiv = null;
  if (password !== '') {
    // Avoid extensive template literals
    const fillClass = 'strength-fill strength-' + strengthColor;
    const labelClass = 'strength-label ' + strengthColor;

    passwordStrengthDiv = (
      <div className="password-strength">
        <div className="strength-bar">
          <div className={fillClass} style={widthStyle}></div>
        </div>
        <span className={labelClass}>{strengthLabel}</span>
      </div>
    );
  }

  let buttonText = 'Create Account';
  if (loading === true) {
    buttonText = 'Creating Account...';
  }

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-hero">
          <div className="basketball-icon">🏀</div>
          <h2>Join the NBA Trivia Community</h2>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>4 Unique Game Modes</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Track Your Progress</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Compete on Leaderboards</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Daily Challenges</span>
            </div>
          </div>
        </div>
      </div>
      <div className="register-right">
        <div className="register-card">
          <h2>Create Account</h2>
          <p className="register-subtitle">Start your NBA trivia journey today</p>

          <form onSubmit={handleSubmit}>
            <div className="name-row">
              <div className="input-group">
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    name="firstName"
                    className="input"
                    placeholder="First Name"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    name="lastName"
                    className="input"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={handleLastNameChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <AtSign className="input-icon" size={18} />
                <input
                  type="text"
                  name="username"
                  className="input"
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  name="email"
                  className="input"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={passwordInputType}
                  name="password"
                  className="input"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              {passwordStrengthDiv}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={passwordInputType}
                  name="confirmPassword"
                  className="input"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
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

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                required
              />
              <span>I accept the Terms & Conditions</span>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {buttonText}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
