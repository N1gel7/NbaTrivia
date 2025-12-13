import React from 'react';
import './Skeleton.css';


const Skeleton = ({ type = 'text', style }) => {
    const classes = `skeleton ${type}`;
    return <div className={classes} style={style}></div>;
};

export default Skeleton;
