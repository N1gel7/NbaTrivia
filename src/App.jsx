import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MVPSpeedChallenge from './pages/games/MVPSpeedChallenge';
import NBAHistoryQuiz from './pages/games/NBAHistoryQuiz';
import NBATrivia from './pages/games/NBATrivia';
import GuessThePlayer from './pages/games/GuessThePlayer';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {

    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('isAuthenticated', 'false');
  };

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
