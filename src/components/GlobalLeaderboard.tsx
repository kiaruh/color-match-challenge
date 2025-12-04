'use client';

import React, { useState, useMemo } from 'react';

export interface Player {
    place: number;
    countryFlag: string;
    nickname: string;
    points: number;
}

interface LeaderboardProps {
    players: Player[];
}

const GlobalLeaderboard: React.FC<LeaderboardProps> = ({ players }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Ensure players are sorted by points high -> low
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, place: i + 1 }));
    }, [players]);

    const displayedPlayers = isExpanded ? sortedPlayers.slice(0, 300) : sortedPlayers.slice(0, 10);

    const getRowStyle = (place: number) => {
        const baseStyle = "flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-0 transition-colors duration-150 hover:bg-gray-50";
        if (place <= 3) {
            return `${baseStyle} font-medium bg-orange-50/30`;
        }
        return `${baseStyle} text-gray-600`;
    };

    const getPlaceStyle = (place: number) => {
        if (place <= 3) return "text-gray-900 font-semibold";
        return "text-gray-400 font-normal";
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                    Leaderboard
                </h2>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {sortedPlayers.length} Players
                </div>
            </div>

            <div className="flex flex-col">
                {displayedPlayers.map((player) => (
                    <div
                        key={`${player.nickname}-${player.place}`}
                        className={getRowStyle(player.place)}
                    >
                        {/* Left Block: [Place] [CountryFlag] [Nickname] */}
                        <div className="flex items-center gap-x-3 min-w-0 overflow-hidden flex-grow">
                            <span className={`w-6 text-center text-sm whitespace-nowrap flex-shrink-0 ${getPlaceStyle(player.place)}`}>
                                {player.place}
                            </span>
                            <span className="text-lg leading-none flex items-center justify-center whitespace-nowrap flex-shrink-0 select-none" role="img" aria-label="flag">
                                {player.countryFlag}
                            </span>
                            <span className="truncate text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                {player.nickname}
                            </span>
                        </div>

                        {/* Right Side: [Points] */}
                        <div className="flex-shrink-0 ml-4 text-right">
                            <span className="text-sm font-mono font-medium text-gray-600 whitespace-nowrap">
                                {player.points.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 text-center border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-md shadow-sm transition-all duration-200"
                >
                    {isExpanded ? 'Show Top 10' : 'Show Top 300'}
                </button>
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
