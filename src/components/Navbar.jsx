import { Link, useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { currentUser } from '../data/mockData';
import './Navbar.css';

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-text">NBA Trivia Master</span>
        </Link>
        
        <div className="navbar-right">
          <div className="user-points-display">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="points-text">{currentUser.stats.totalPoints.toLocaleString()} pts</span>
          </div>
          
          <div className="user-info">
            <div className="user-avatar">{currentUser.username.charAt(0).toUpperCase()}</div>
            <span className="username">{currentUser.username}</span>
          </div>
          
          <button onClick={handleLogout} className="btn-logout">
            Logout →
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
