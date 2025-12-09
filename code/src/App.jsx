import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MVPSpeedChallenge from './pages/games/MVPSpeedChallenge';
import NBAHistoryQuiz from './pages/games/NBAHistoryQuiz';
import NBATrivia from './pages/games/NBATrivia';
import GuessThePlayer from './pages/games/GuessThePlayer';

import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    Cookies.remove('auth_token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/game/mvp-speed"
          element={
            isAuthenticated ? <MVPSpeedChallenge /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/game/history"
          element={
            isAuthenticated ? <NBAHistoryQuiz /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/game/trivia"
          element={
            isAuthenticated ? <NBATrivia /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/game/guess-player"
          element={
            isAuthenticated ? <GuessThePlayer /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
