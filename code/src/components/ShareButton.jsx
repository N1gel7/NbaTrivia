
import { Share2 } from 'lucide-react';
import { useState } from 'react';


function ShareButton({ score, total, gameMode, points }) {
    const [copied, setCopied] = useState(false);

    const gameModeNames = {
        trivia: 'NBA Trivia',
        history: 'NBA History Quiz',
        guess_player: 'Guess the Player',
        mvp_speed: 'MVP Speed Challenge'
    };

    const handleShare = async () => {
        const text = `🏀 I just scored ${score}/${total} on ${gameModeNames[gameMode] || 'NBA Trivia'}!${points ? ` ${points} points earned.` : ''} Can you beat me?`;
        const url = window.location.origin;
        const fullText = `${text}\n\n${url}`;


        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'NBA Trivia Master',
                    text: text,
                    url: url
                });
                return;
            } catch (err) {
                if (err.name !== 'AbortError') console.log('Share failed:', err);
            }
        }


        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = fullText;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (e) {
                alert('Could not share. Please take a screenshot!');
            }
        }
    };

    return (
        <button
            className="btn btn-secondary"
            onClick={handleShare}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative'
            }}
        >
            <Share2 size={18} />
            {copied ? '✅ Copied!' : 'Share Score'}
        </button>
    );
}

export default ShareButton;
