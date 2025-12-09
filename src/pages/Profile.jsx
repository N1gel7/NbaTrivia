import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { currentUser } from '../data/mockData';
import './Profile.css';

function Profile({ onLogout }) {
  const navigate = useNavigate();
  const { stats, gameModeStats, achievements, recentActivity } = currentUser;

  return (
    <div className="profile-page">
      <Navbar onLogout={onLogout} />
      
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">{currentUser.profilePic}</div>
          <div className="profile-info">
            <h1>{currentUser.username}</h1>
            <p className="profile-email">{currentUser.email}</p>
            <p className="profile-join-date">Member since {currentUser.joinDate}</p>
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
                <span>Current Streak:</span>
                <span className="stat-value-small">{gameModeStats.trivia.currentStreak} correct</span>
              </div>
              <div className="game-stat-item">
                <span>Games Played:</span>
                <span className="stat-value-small">{gameModeStats.trivia.gamesPlayed}</span>
              </div>
            </div>

            <div className="game-stat-card">
              <h3>Guess the Player</h3>
              <div className="game-stat-item">
                <span>Success Rate:</span>
                <span className="stat-value-small">{gameModeStats.guessPlayer.successRate}%</span>
              </div>
              <div className="game-stat-item">
                <span>Games Played:</span>
                <span className="stat-value-small">{gameModeStats.guessPlayer.gamesPlayed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements-section">
          <h2 className="section-title">Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-name">{achievement.name}</div>
                {!achievement.earned && (
                  <div className="achievement-locked">🔒</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-timeline">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-date">{activity.date}</div>
                <div className="activity-content">
                  <div className="activity-game">{activity.game}</div>
                  <div className="activity-score">Score: {activity.score}</div>
                </div>
              </div>
            ))}
          </div>
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

