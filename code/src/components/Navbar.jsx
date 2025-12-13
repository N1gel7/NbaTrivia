
import { Link, useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '../supabaseClient';
import './Navbar.css';

/**
 * Main Navigation Bar
 * Handles user display, logout, and conditional rendering based on role.
 */
function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const [navUser, setNavUser] = useState({ username: 'Player', points: 0, role: 'user' });

  useEffect(() => {
    fetchNavData();
  }, []);

  // Helper to decode JWT for UI purposes
  // Note: All security checks are also performed server-side
  const decodeJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const fetchNavData = async () => {
    const token = Cookies.get('auth_token');
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.id) {
        // Fetch up-to-date points from DB
        const { data } = await supabase
          .from('user_global_stats')
          .select('total_points')
          .eq('user_id', decoded.id)
          .single();

        setNavUser({
          username: decoded.username || 'Player',
          points: data?.total_points || 0,
          role: decoded.role || 'user'
        });
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-text">NBA Trivia Master</span>
        </Link>

        <div className="navbar-right">
          {/* Admin users don't need points display usually */}
          {navUser.role !== 'admin' && (
            <div className="user-points-display">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="points-text">{navUser.points.toLocaleString()} pts</span>
            </div>
          )}

          <div className="user-info">
            <div className="user-avatar">{navUser.username.charAt(0).toUpperCase()}</div>
            <span className="username">{navUser.username}</span>
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
