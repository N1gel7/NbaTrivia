import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

function GameModeCard({ to, Icon, title, description, bestScore, bestLabel, delay, className }) {
    const style = {
        animationDelay: `${delay}ms`
    };

    return (
        <Link to={to} className={`game-mode-card fade-in ${className || ''}`} style={style}>
            <div className="card-icon-wrapper">
                <Icon className="card-icon" size={32} strokeWidth={2} />
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>

            <div className="personal-best-badge">
                <Star className="star-icon" size={12} fill="currentColor" />
                <span>Personal Best: {bestScore} {bestLabel}</span>
            </div>

            <button className="btn-play group" type="button">
                <span>Play Now</span>
                <ArrowRight className="arrow-icon" size={18} strokeWidth={2.5} />
            </button>
        </Link>
    );
}

export default GameModeCard;
