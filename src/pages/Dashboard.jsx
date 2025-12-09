import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, TrendingUp, Award, BookOpen, Trophy, UserCircle, Star, ArrowRight, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { currentUser, leaderboardData } from '../data/mockData';
import './Dashboard.css';

function Dashboard({ onLogout }) {

  const [animatedStats, setAnimatedStats] = useState({
    totalQuestions: 0,
    dailyStreak: 0,
    avgScore: 0,
    currentRank: 0
  });

  const stats = currentUser.stats;
  const gameStats = currentUser.gameModeStats;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    const easeOutCubic = (t) => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animateValue = (start, end, callback) => {
      const range = end - start;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easedProgress = easeOutCubic(progress);
        const current = start + range * easedProgress;

        if (step >= steps) {
          callback(end);
          clearInterval(timer);
        } else {
          callback(Math.floor(current));
        }
      }, stepDuration);
    };

    animateValue(0, stats.totalQuestions, (val) => {
      setAnimatedStats(prev => ({ ...prev, totalQuestions: val }));
    });

    animateValue(0, stats.dailyStreak, (val) => {
      setAnimatedStats(prev => ({ ...prev, dailyStreak: val }));
    });

    animateValue(0, stats.avgScore, (val) => {
      setAnimatedStats(prev => ({ ...prev, avgScore: val }));
    });

    animateValue(0, stats.currentRank, (val) => {
      setAnimatedStats(prev => ({ ...prev, currentRank: val }));
    });
  }, []);

  return (
    <div className="dashboard">

      <div style={{ position: 'fixed', top: '0', left: '0', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(29, 66, 138, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '0', right: '0', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: -1, pointerEvents: 'none' }} />

      <Navbar onLogout={onLogout} />
      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card stat-card-1 fade-in" style={{ animationDelay: '0ms' }}>
            <div className="stat-icon-wrapper">
              <BarChart3 className="stat-icon" size={24} strokeWidth={2.5} color="#1d428a" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Questions Answered</div>
              <div className="stat-value">{animatedStats.totalQuestions}</div>
            </div>
          </div>

          <div className="stat-card stat-card-2 fade-in" style={{ animationDelay: '100ms' }}>
            <div className="stat-icon-wrapper">
              <Flame className="stat-icon flame-pulse" size={24} strokeWidth={2.5} color="#ff6b35" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Daily Streak</div>
              <div className="stat-value">{animatedStats.dailyStreak}</div>
            </div>
          </div>

          <div className="stat-card stat-card-3 fade-in" style={{ animationDelay: '200ms' }}>
            <div className="stat-icon-wrapper">
              <TrendingUp className="stat-icon" size={24} strokeWidth={2.5} color="#1d428a" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{animatedStats.avgScore}%</div>
            </div>
          </div>

          <div className="stat-card stat-card-4 fade-in" style={{ animationDelay: '300ms' }}>
            <div className="stat-icon-wrapper">
              <Award className="stat-icon" size={24} strokeWidth={2.5} color="#b45309" />
            </div>
            <div className="stat-content">
              <div className="stat-label">Current Rank</div>
              <div className="stat-value">#{animatedStats.currentRank}</div>
            </div>
          </div>
        </div>

        {/* Game Modes Section */}
        <div className="game-modes-section">
          <h2 className="section-title">Game Modes</h2>
          <div className="game-modes-grid">
            <Link to="/game/mvp-speed" className="game-mode-card card-mvp-speed fade-in" style={{ animationDelay: '400ms' }}>
              <div className="card-icon-wrapper">
                <Clock className="card-icon" size={32} strokeWidth={2} />
              </div>
              <h3 className="card-title">MVP Speed Challenge</h3>
              <p className="card-description">Name as many MVPs as you can in 60 seconds. Race against the clock!</p>
              <div className="personal-best-badge">
                <Star className="star-icon" size={12} fill="currentColor" />
                <span>Personal Best: {gameStats.mvpSpeed.best} MVPs</span>
              </div>
              <button className="btn-play group" type="button">
                <span>Play Now</span>
                <ArrowRight className="arrow-icon" size={18} strokeWidth={2.5} />
              </button>
            </Link>

            <Link to="/game/history" className="game-mode-card card-history fade-in" style={{ animationDelay: '500ms' }}>
              <div className="card-icon-wrapper">
                <BookOpen className="card-icon" size={32} strokeWidth={2} />
              </div>
              <h3 className="card-title">NBA History</h3>
              <p className="card-description">Deep dive into the archives. Answer questions from different eras.</p>
              <div className="personal-best-badge">
                <Star className="star-icon" size={12} fill="currentColor" />
                <span>Progress: {gameStats.history.questionsAnswered}/200</span>
              </div>
              <button className="btn-play group" type="button">
                <span>Play Now</span>
                <ArrowRight className="arrow-icon" size={18} strokeWidth={2.5} />
              </button>
            </Link>

            <Link to="/game/trivia" className="game-mode-card card-trivia fade-in" style={{ animationDelay: '600ms' }}>
              <div className="card-icon-wrapper">
                <Trophy className="card-icon" size={32} strokeWidth={2} />
              </div>
              <h3 className="card-title">NBA Trivia</h3>
              <p className="card-description">The ultimate test of basketball knowledge. Random questions from all categories.</p>
              <div className="personal-best-badge">
                <Star className="star-icon" size={12} fill="currentColor" />
                <span>Current Streak: {gameStats.trivia.currentStreak}</span>
              </div>
              <button className="btn-play group" type="button">
                <span>Play Now</span>
                <ArrowRight className="arrow-icon" size={18} strokeWidth={2.5} />
              </button>
            </Link>

            <Link to="/game/guess-player" className="game-mode-card card-guess fade-in" style={{ animationDelay: '700ms' }}>
              <div className="card-icon-wrapper">
                <UserCircle className="card-icon" size={32} strokeWidth={2} />
              </div>
              <h3 className="card-title">Who Am I?</h3>
              <p className="card-description">Identify the player based on career stats, teams, and achievements.</p>
              <div className="personal-best-badge">
                <Star className="star-icon" size={12} fill="currentColor" />
                <span>Success Rate: {gameStats.guessPlayer.successRate}%</span>
              </div>
              <button className="btn-play group" type="button">
                <span>Play Now</span>
                <ArrowRight className="arrow-icon" size={18} strokeWidth={2.5} />
              </button>
            </Link>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="leaderboard-section">
          <h2 className="section-title">Leaderboard</h2>


          <div className="leaderboard-table-container">
            <div className="leaderboard-header-row">
              <div className="col-rank">Rank</div>
              <div className="col-player">Player</div>
              <div className="col-points">Points</div>
              <div className="col-avg">Avg Score</div>
              <div className="col-active">Last Active</div>
            </div>

            {leaderboardData['global'].map((user, index) => {
              const isCurrentUser = user.username === currentUser.username;
              return (
                <div
                  key={index}
                  className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="col-rank">
                    {user.rank === 1 && (
                      <div className="rank-badge rank-first">1</div>
                    )}
                    {user.rank === 2 && (
                      <div className="rank-badge rank-second">2</div>
                    )}
                    {user.rank === 3 && (
                      <div className="rank-badge rank-third">3</div>
                    )}
                    {user.rank > 3 && (
                      <div className="rank-badge rank-other">{user.rank}</div>
                    )}
                  </div>
                  <div className="col-player">{user.username}</div>
                  <div className="col-points">{user.points.toLocaleString()}</div>
                  <div className="col-avg">{user.avgScore}%</div>
                  <div className="col-active">{user.lastActive}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
