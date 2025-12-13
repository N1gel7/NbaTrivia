
import confetti from 'canvas-confetti';

export const celebratePerfectScore = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#1d428a', '#ff6b35', '#ffd700'];

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};


export const celebrateAchievement = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1d428a', '#ff6b35', '#ffd700']
    });
};


export const celebrateHighScore = () => {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#ff6b35']
    });
};


export const celebrateGameComplete = () => {
    confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1d428a', '#ff6b35', '#ffd700']
    });
};
