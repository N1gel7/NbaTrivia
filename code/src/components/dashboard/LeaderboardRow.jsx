import React from 'react';

function LeaderboardRow({ user, isCurrentUser }) {
    let rankBadge = null;

    if (user.rank === 1) {
        rankBadge = <div className="rank-badge rank-first">1</div>;
    } else if (user.rank === 2) {
        rankBadge = <div className="rank-badge rank-second">2</div>;
    } else if (user.rank === 3) {
        rankBadge = <div className="rank-badge rank-third">3</div>;
    } else {
        rankBadge = <div className="rank-badge rank-other">{user.rank}</div>;
    }

    const rowClass = `leaderboard-row ${isCurrentUser ? 'current-user' : ''}`;

    return (
        <div className={rowClass}>
            <div className="col-rank">
                {rankBadge}
            </div>
            <div className="col-player">{user.username}</div>
            <div className="col-points">{user.points ? user.points.toLocaleString() : 0}</div>
            <div className="col-avg">{user.avgScore}%</div>
            <div className="col-active">{user.lastActive}</div>
        </div>
    );
}

export default LeaderboardRow;
