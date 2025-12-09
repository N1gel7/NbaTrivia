import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GameHistory from '../components/GameHistory';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '../supabaseClient';
import './Profile.css';

function Profile({ onLogout }) {
  const navigate = useNavigate();

  const [user, setUser] = useState({ username: '', email: '', joinDate: '' });
  const [stats, setStats] = useState({
    totalQuestions: 0,
    avgScore: 0,
    totalPoints: 0,
    hoursPlayed: 0
  });
  const [gameModeStats, setGameModeStats] = useState({
    mvpSpeed: { best: 0, gamesPlayed: 0 },
    trivia: { gamesPlayed: 0 },
    history: { accuracy: 0, gamesPlayed: 0 },
    guessPlayer: { gamesPlayed: 0 }
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const decodeJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const fetchProfileData = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const decoded = decodeJwt(token);
      if (!decoded) {
        navigate('/login');
        return;
      }
      const userId = decoded.id;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        setUser({
          username: userData.username,
          email: userData.email,
          joinDate: new Date(userData.created_at).toLocaleDateString()
        });
      }


      const { data: globalStats } = await supabase
        .from('user_global_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (globalStats) {
        setStats({
          totalQuestions: globalStats.total_questions || 0,
          avgScore: globalStats.avg_score || 0,
          totalPoints: globalStats.total_points || 0,
          hoursPlayed: globalStats.hours_played || 0
        });
      }


      const { data: modeStats } = await supabase
        .from('user_game_mode_stats')
        .select('*')
        .eq('user_id', userId);

      if (modeStats) {
        // Simple mapping manually
        let mvpBest = 0;
        let historyAcc = 0;

        modeStats.forEach(mode => {
          if (mode.game_mode === 'mvp_speed') {
            mvpBest = mode.best_score;
          }
          // Add more mappings here simply
        });

        setGameModeStats(prev => ({
          ...prev,
          mvpSpeed: { ...prev.mvpSpeed, best: mvpBest }
        }));
      }



      setLoading(false);

    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading Profile...</div>;
  }

  return (
    <div className="profile-page">
      <Navbar onLogout={onLogout} />

      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large"></div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-join-date">Member since {user.joinDate}</p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="stats-section">
          <h2 className="section-title">Overall Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">❓</div>
              <div className="stat-details">
                <div className="stat-value">{stats.totalQuestions}</div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🎯</div>
              <div className="stat-details">
                <div className="stat-value">{stats.avgScore}%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🏆</div>
              <div className="stat-details">
                <div className="stat-value">{stats.totalPoints.toLocaleString()}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">⏱️</div>
              <div className="stat-details">
                <div className="stat-value">{stats.hoursPlayed}</div>
                <div className="stat-label">Hours Played</div>
              </div>
            </div>
          </div>
        </div>

        {/* Per Game Mode Stats */}
        <div className="game-mode-stats-section">
          <h2 className="section-title">Per Game Mode Performance</h2>
          <div className="game-stats-grid">
            <div className="game-stat-card">
              <h3>MVP Speed Challenge</h3>
              <div className="game-stat-item">
                <span>Personal Best:</span>
                <span className="stat-value-small">{gameModeStats.mvpSpeed.best} MVPs</span>
              </div>
              <div className="game-stat-item">
                <span>Games Played:</span>
                <span className="stat-value-small">{gameModeStats.mvpSpeed.gamesPlayed}</span>
              </div>
            </div>

            <div className="game-stat-card">
              <h3>NBA History</h3>
              <div className="game-stat-item">
                <span>Questions Answered:</span>
                <span className="stat-value-small">{gameModeStats.history.questionsAnswered}/{gameModeStats.history.totalQuestions}</span>
              </div>
              <div className="game-stat-item">
                <span>Accuracy:</span>
                <span className="stat-value-small">{gameModeStats.history.accuracy}%</span>
              </div>
            </div>

            <div className="game-stat-card">
              <h3>NBA Trivia</h3>
              <div className="game-stat-item">
                <span>Games Played:</span>
                <span className="stat-value-small">{gameModeStats.trivia.gamesPlayed}</span>
              </div>
            </div>

            <div className="game-stat-card">
              <h3>Guess the Player</h3>
              <div className="game-stat-item">
                <span>Games Played:</span>
                <span className="stat-value-small">{gameModeStats.guessPlayer.gamesPlayed}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Recent Activity */}
        <div className="activity-section">
          <h2 className="section-title">Recent Games</h2>
          <GameHistory limit={10} />
        </div>

        {/* Back to Dashboard */}
        <div className="profile-actions">
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;

