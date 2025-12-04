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
        <div className="w-full max-w-xl mx-auto rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 shadow-sm font-sans">
            <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Leaderboard</h2>
                <span className="text-xs text-[var(--text-secondary)]">
                    {sorted.length} {sorted.length === 1 ? 'Player' : 'Players'}
                </span>
            </div>

            <div className="divide-y divide-[var(--border-primary)]">
                {visible.map((p, idx) => {
                    const rank = p.place ?? idx + 1;

                    return (
                        <div
                            key={`${p.nickname}-${p.points}-${rank}`}
                            // layout-critical styles here
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap',
                            }}
                            className="hover:bg-[var(--bg-secondary)] transition-colors duration-150"
                        >
                            {/* LEFT BLOCK: [Place] [Flag] [Nickname] */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span
                                    style={{ width: '2rem', textAlign: 'right', flexShrink: 0 }}
                                    className="font-mono text-xs text-[var(--text-secondary)]"
                                >
                                    #{rank}
                                </span>

                                <span
                                    style={{ flexShrink: 0, fontSize: '1rem', lineHeight: 1 }}
                                    className="select-none"
                                    role="img"
                                    aria-label="flag"
                                >
                                    {p.countryFlag}
                                </span>

                                <span
                                    style={{
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                    className="font-medium text-[var(--text-primary)]"
                                >
                                    {p.nickname}
                                </span>
                            </div>

                            {/* RIGHT SIDE: [points] */}
                            <div
                                style={{
                                    marginLeft: '1rem',
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                }}
                                className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]"
                            >
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
                    className="rounded-[var(--radius-sm)] border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    {showAll ? 'Show Top 10' : 'Show Top 300'}
                </button>
            </div>
        </div>
    );
}
