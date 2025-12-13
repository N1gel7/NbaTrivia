import React from 'react';

function StatCard({ Icon, iconColor, label, value, delay, className }) {
    const style = {
        animationDelay: `${delay}ms`
    };

    return (
        <div className={`stat-card fade-in ${className || ''}`} style={style}>
            <div className="stat-icon-wrapper">
                <Icon className="stat-icon" size={24} strokeWidth={2.5} color={iconColor} />
            </div>
            <div className="stat-content">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
}

export default StatCard;
