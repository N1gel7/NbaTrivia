
class SoundManager {
    constructor() {
        this.enabled = true;
        this.sounds = {
            correct: new Audio('/sounds/correct.mp3'),
            wrong: new Audio('/sounds/wrong.mp3'),
            complete: new Audio('/sounds/complete.mp3')

        };


        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.volume = 0.3;
        });
    }


    play(soundName) {
        if (!this.enabled) return;

        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => {
                console.log('Sound play blocked:', err);
            });
        }
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = Math.max(0, Math.min(1, volume));
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

export const soundManager = new SoundManager();
