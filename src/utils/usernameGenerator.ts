// Cool username generator with emojis for millennials

const emojis = [
    '🎨', '🌈', '✨', '🎯', '🔥', '💎', '⚡', '🌟', '🎪', '🎭',
    '🎬', '🎮', '🎲', '🎰', '🎳', '🏆', '🥇', '🎖️', '👑', '💫',
    '🌺', '🌸', '🌼', '🌻', '🌷', '🦄', '🦋', '🐉', '🦅', '🦊'
];

const adjectives = [
    'Cosmic', 'Mystic', 'Epic', 'Legendary', 'Supreme', 'Ultimate',
    'Stellar', 'Radiant', 'Vibrant', 'Dazzling', 'Brilliant', 'Luminous',
    'Neon', 'Electric', 'Quantum', 'Digital', 'Cyber', 'Pixel',
    'Rainbow', 'Prism', 'Crystal', 'Diamond', 'Golden', 'Silver',
    'Turbo', 'Hyper', 'Ultra', 'Mega', 'Super', 'Infinite'
];

const nouns = [
    'Artist', 'Wizard', 'Master', 'Legend', 'Champion', 'Hero',
    'Ninja', 'Samurai', 'Knight', 'Warrior', 'Hunter', 'Seeker',
    'Dreamer', 'Creator', 'Maker', 'Builder', 'Designer', 'Painter',
    'Phantom', 'Shadow', 'Spirit', 'Phoenix', 'Dragon', 'Tiger',
    'Wolf', 'Eagle', 'Falcon', 'Hawk', 'Lion', 'Bear'
];

/**
 * Generate a random cool username with emoji
 * Examples: "🎨 Cosmic Artist", "⚡ Neon Wizard", "🌈 Rainbow Master"
 */
export function generateRandomUsername(): string {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${emoji} ${adjective}${noun}`;
}

/**
 * Generate multiple unique usernames
 */
export function generateMultipleUsernames(count: number): string[] {
    const usernames = new Set<string>();

    while (usernames.size < count) {
        usernames.add(generateRandomUsername());
    }

    return Array.from(usernames);
}

/**
 * Get default username (for users who don't choose one)
 */
export function getDefaultUsername(): string {
    return `Player${Math.floor(Math.random() * 9000) + 1000}`;
}
