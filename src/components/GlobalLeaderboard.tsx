'use client';

import React, { useState, useMemo } from 'react';

export interface Player {
    place: number;
    countryCode: string;
    nickname: string;
    points: number;
}

interface GlobalLeaderboardProps {
    players: Player[];
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ players }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Ensure players are sorted by points high -> low
    // Memoize to avoid expensive re-sorting on every render if props don't change
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, place: i + 1 }));
    }, [players]);

    const displayedPlayers = isExpanded ? sortedPlayers.slice(0, 300) : sortedPlayers.slice(0, 10);

    const getMedalColor = (place: number) => {
        switch (place) {
            case 1: return 'text-yellow-400'; // Gold
            case 2: return 'text-gray-300';   // Silver
            case 3: return 'text-amber-600';  // Bronze
            default: return 'text-gray-500';
        }
    };

    const getRowStyle = (place: number) => {
        if (place <= 3) {
            return 'bg-white/10 font-bold border-l-4 border-yellow-400';
        }
        return 'bg-white/5 border-l-4 border-transparent hover:bg-white/10';
    };

    // Helper to get flag emoji from country code
    const getFlagEmoji = (countryCode: string) => {
        if (!countryCode) return '🏳️';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Leaderboard
                </h2>
                <div className="text-sm text-gray-400">
                    {sortedPlayers.length} Players
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {displayedPlayers.map((player) => (
                    <div
                        key={`${player.nickname}-${player.place}`}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${getRowStyle(player.place)}`}
                    >
                        {/* Left Side: Points */}
                        <div className="flex-shrink-0 w-24 text-left font-mono text-lg text-blue-300">
                            {player.points.toLocaleString()}
                        </div>

                        {/* Right Side: Place, Flag, Nickname */}
                        <div className="flex items-center justify-end gap-4 flex-grow text-right">
                            <div className="flex items-center gap-2">
                                <span className={`font-mono w-8 text-center ${getMedalColor(player.place)}`}>
                                    #{player.place}
                                </span>
                                <span className="text-xl" role="img" aria-label={player.countryCode}>
                                    {getFlagEmoji(player.countryCode)}
                                </span>
                                <span className="truncate max-w-[150px] sm:max-w-[200px] text-right">
                                    {player.nickname}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-blue-500/30"
                >
                    {isExpanded ? 'Show Top 10' : 'Show Top 300'}
                </button>
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
