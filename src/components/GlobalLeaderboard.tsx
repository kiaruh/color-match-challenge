'use client';

import React, { useState } from 'react';

export type Player = {
    place: number;          // e.g. 1
    countryFlag: string;    // e.g. "🇺🇸"
    nickname: string;       // e.g. "UltraHero"
    points: number;         // e.g. 4209
};

type GlobalLeaderboardProps = {
    players: Player[];
};

export default function GlobalLeaderboard({ players }: GlobalLeaderboardProps) {
    // Safety: always sort players by points high -> low
    const sorted = [...players].sort((a, b) => b.points - a.points);

    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? sorted.slice(0, 300) : sorted.slice(0, 10);

    return (
        <div className="w-full max-w-xl mx-auto rounded-xl border border-neutral-200 bg-white p-4 shadow-sm font-sans">
            <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Leaderboard</h2>
                <span className="text-xs text-neutral-500">
                    {sorted.length} {sorted.length === 1 ? 'Player' : 'Players'}
                </span>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50/60">
                {visible.map((p, idx) => {
                    // Use the precomputed place; if needed, you can recompute from sorted
                    const rank = p.place ?? idx + 1;

                    return (
                        <div
                            key={`${p.nickname}-${p.points}-${rank}`}
                            className={`
                flex flex-nowrap items-center justify-between gap-3 px-3 py-2 text-sm
                hover:bg-neutral-100 transition-colors duration-150
              `}
                        >
                            {/* LEFT BLOCK: [Place] [Flag] [Nickname] */}
                            <div className="flex min-w-0 flex-nowrap items-center gap-2 whitespace-nowrap">
                                <span className="w-8 shrink-0 text-right font-mono text-xs text-neutral-500">
                                    #{rank}
                                </span>

                                <span
                                    className="shrink-0 select-none text-base leading-none"
                                    role="img"
                                    aria-label="flag"
                                >
                                    {p.countryFlag}
                                </span>

                                <span className="min-w-0 truncate font-medium text-neutral-900">
                                    {p.nickname}
                                </span>
                            </div>

                            {/* RIGHT SIDE: [points] */}
                            <div className="ml-4 shrink-0 whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-neutral-900">
                                {p.points.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                    {showAll ? 'Show Top 10' : 'Show Top 300'}
                </button>
            </div>
        </div>
    );
}
