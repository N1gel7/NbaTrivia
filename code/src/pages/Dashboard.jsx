
import { useState, useEffect } from 'react';
import { Clock, Flame, TrendingUp, Award, BookOpen, Trophy, UserCircle, BarChart3 } from 'lucide-react';
import Cookies from 'js-cookie';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import StatCard from '../components/dashboard/StatCard';
import GameModeCard from '../components/dashboard/GameModeCard';
import LeaderboardRow from '../components/dashboard/LeaderboardRow';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    dailyStreak: 0,
    avgScore: 0,
    currentRank: 0
  });

  const [gameStats, setGameStats] = useState({
    mvpSpeed: { best: 0 },
    history: { best: 0 },
    trivia: { best: 0 },
    guessPlayer: { best: 0 }
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    totalQuestions: 0,
    dailyStreak: 0,
    avgScore: 0,
    currentRank: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const decodeJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = decodeJwt(token);
      const userId = decoded?.id;
      const username = decoded?.username;

      if (!userId) {
        setLoading(false);
        return;
      }

      setCurrentUser({ username });

      let { data: globalStats } = await supabase
        .from('user_global_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!globalStats) {
        globalStats = { total_questions: 0, daily_streak: 0, avg_score: 0, current_rank: 0 };
      }

      const { count: rankCount } = await supabase
        .from('user_global_stats')
        .select('user_id', { count: 'exact', head: true })
        .gt('total_points', globalStats.total_points || 0);

      const realRank = (rankCount || 0) + 1;
      const { data: modes } = await supabase
        .from('user_game_mode_stats')
        .select('*')
        .eq('user_id', userId);

      const newGameStats = {
        mvpSpeed: { best: 0 },
        history: { best: 0 },
        trivia: { best: 0 },
        guessPlayer: { best: 0 }
      };

      if (modes) {
        modes.forEach(m => {
          if (m.game_mode === 'mvp_speed') newGameStats.mvpSpeed.best = m.best_score || 0;
          if (m.game_mode === 'history') newGameStats.history.best = m.best_score || 0;
          if (m.game_mode === 'trivia') newGameStats.trivia.best = m.best_score || 0;
          if (m.game_mode === 'guess_player') newGameStats.guessPlayer.best = m.best_score || 0;
        });
      }

      setGameStats(newGameStats);
      const { data: topUsers } = await supabase
        .from('user_global_stats')
        .select(`
          total_points,
          avg_score,
          users (username, last_active)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (topUsers) {
        const formattedLeaderboard = topUsers.map((u, index) => ({
          rank: index + 1,
          username: u.users.username,
          points: u.total_points,
          avgScore: u.avg_score,
          lastActive: new Date(u.users.last_active).toLocaleDateString()
        }));
        setLeaderboard(formattedLeaderboard);
      }

      setLoading(false);
      startAnimations({
        totalQuestions: globalStats.total_questions,
        dailyStreak: globalStats.daily_streak,
        avgScore: globalStats.avg_score,
        currentRank: realRank
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const startAnimations = (finalStats) => {
    const steps = 60;
    const duration = 1500;
    const stepDuration = duration / steps;
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const animate = (key, endValue) => {
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = easeOutCubic(step / steps);
        const current = Math.floor(endValue * progress);

        setAnimatedStats(prev => ({
          ...prev,
          [key]: current
        }));

        if (step >= steps) {
          setAnimatedStats(prev => ({ ...prev, [key]: endValue }));
          clearInterval(timer);
        }
      }, stepDuration);
    };

    animate('totalQuestions', finalStats.totalQuestions || 0);
    animate('dailyStreak', finalStats.dailyStreak || 0);
    animate('avgScore', finalStats.avgScore || 0);
    animate('currentRank', finalStats.currentRank || 0);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar onLogout={() => { }} />
        <div className="dashboard-content">
          <div className="stats-section">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="stat-card" style={{ height: '160px' }}>
                <Skeleton type="text" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-bg-left" />
      <div className="dashboard-bg-right" />

      <Navbar onLogout={onLogout} />

      <div className="dashboard-content">

        <div className="stats-section">
          <StatCard
            Icon={BarChart3} iconColor="#1d428a"
            label="Questions Answered"
            value={animatedStats.totalQuestions}
            delay={0} className="stat-card-1"
          />
          <StatCard
            Icon={Flame} iconColor="#ff6b35"
            label="Daily Streak"
            value={animatedStats.dailyStreak}
            delay={100} className="stat-card-2"
          />
          <StatCard
            Icon={TrendingUp} iconColor="#1d428a"
            label="Average Score"
            value={`${animatedStats.avgScore}%`}
            delay={200} className="stat-card-3"
          />
          <StatCard
            Icon={Award} iconColor="#b45309"
            label="Current Rank"
            value={`#${animatedStats.currentRank}`}
            delay={300} className="stat-card-4"
          />
        </div>

        <div className="game-modes-section">
          <h2 className="section-title">Game Modes</h2>
          <div className="game-modes-grid">
            <GameModeCard
              to="/game/mvp-speed"
              Icon={Clock}
              title="MVP Speed Challenge"
              description="Name as many MVPs as you can in 60 seconds. Race against the clock!"
              bestScore={gameStats.mvpSpeed.best}
              bestLabel="MVPs"
              delay={400}
              className="card-mvp-speed"
            />
            <GameModeCard
              to="/game/history"
              Icon={BookOpen}
              title="NBA History"
              description="Deep dive into the archives. Answer questions from different eras."
              bestScore={gameStats.history.best}
              bestLabel="/10 Correct"
              delay={500}
              className="card-history"
            />
            <GameModeCard
              to="/game/trivia"
              Icon={Trophy}
              title="NBA Trivia"
              description="The ultimate test of basketball knowledge. Random questions from all categories."
              bestScore={gameStats.trivia.best}
              bestLabel="Points"
              delay={600}
              className="card-trivia"
            />
            <GameModeCard
              to="/game/guess-player"
              Icon={UserCircle}
              title="Who Am I?"
              description="Identify the player based on career stats, teams, and achievements."
              bestScore={gameStats.guessPlayer.best}
              bestLabel="Points"
              delay={700}
              className="card-guess"
            />
          </div>
        </div>

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

            {leaderboard.map((user, index) => (
              <LeaderboardRow
                key={index}
                user={user}
                isCurrentUser={currentUser && user.username === currentUser.username}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
