// Sound utility for generating and playing game sounds using Web Audio API

class SoundManager {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
        if (this.isMuted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Chat notification - ICQ-style "uh oh"
    playChatNotification() {
        if (this.isMuted || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        this.playTone(800, 0.1);
        setTimeout(() => this.playTone(600, 0.15), 100);
    }

    // Score sounds
    playScorePoor() {
        // Sad descending trombone
        if (this.isMuted || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }

    playScoreFair() {
        // Neutral beep
        this.playTone(440, 0.2, 'square');
    }

    playScoreGood() {
        // Positive ascending chime
        if (this.isMuted || !this.audioContext) return;

        this.playTone(523, 0.15); // C
        setTimeout(() => this.playTone(659, 0.2), 100); // E
    }

    playScoreExcellent() {
        // Celebration fanfare
        if (this.isMuted || !this.audioContext) return;

        this.playTone(523, 0.1); // C
        setTimeout(() => this.playTone(659, 0.1), 80); // E
        setTimeout(() => this.playTone(784, 0.1), 160); // G
        setTimeout(() => this.playTone(1047, 0.3), 240); // C (high)
    }
}

// Singleton instance
export const soundManager = new SoundManager();

// Helper function to play score sound based on score value
export function playScoreSound(score: number) {
    if (score > 900) {
        soundManager.playScoreExcellent();
    } else if (score > 700) {
        soundManager.playScoreGood();
    } else if (score > 400) {
        soundManager.playScoreFair();
    } else {
        soundManager.playScorePoor();
    }
}
