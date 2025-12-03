'use client';

import React, { useEffect, useState } from 'react';
import { getSoloRankings } from '../utils/api';

interface LiveSoloRaceProps {
    currentScore: number;
    playerName: string;
}

interface RankingEntry {
    name: string;
    score: number;
    rounds: number;
    timestamp: string;
}

export const LiveSoloRace: React.FC<LiveSoloRaceProps> = ({ currentScore, playerName }) => {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const data = await getSoloRankings(10);
                setRankings(data);
            } catch (error) {
                console.error('Failed to fetch rankings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankings();
    }, []);

    const getPosition = (score: number): number => {
        const maxScore = Math.max(...rankings.map(r => r.score), currentScore, 1000);
        return Math.max(0, Math.min(95, (score / maxScore) * 95));
    };

    // Combine current player with rankings
    const allPlayers = [
        { name: `${playerName} (You)`, score: currentScore, isCurrentPlayer: true },
        ...rankings.slice(0, 10).map(r => ({ ...r, isCurrentPlayer: false }))
    ].sort((a, b) => b.score - a.score);

    if (isLoading) {
        return (
            <div className="live-race glass">
                <div className="loading">Loading leaderboard...</div>
                <style jsx>{`
                    .live-race {
                        padding: var(--spacing-lg);
                        border-radius: var(--radius-xl);
                        background: rgba(0, 0, 0, 0.3);
                        min-height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .loading {
                        color: var(--color-text-secondary);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="live-race glass">
            <h3 className="race-title">🏁 Live Rankings</h3>
            <div className="race-track">
                {allPlayers.slice(0, 11).map((player, index) => {
                    const position = getPosition(player.score);
                    const isCurrentPlayer = player.isCurrentPlayer;

                    return (
                        <div key={index} className={`race-lane ${isCurrentPlayer ? 'current-player' : ''}`}>
                            <div className="lane-info">
                                <span className="lane-rank">#{index + 1}</span>
                                <span className="lane-name">{player.name}</span>
                                <span className="lane-score">{player.score.toLocaleString()}</span>
                            </div>
                            <div className="lane-track">
                                <div
                                    className="runner"
                                    style={{ left: `${position}%` }}
                                >
                                    {isCurrentPlayer ? '🎯' : '🏃'}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="finish-line">🏁</div>
            </div>

            <style jsx>{`
                .live-race {
                    padding: var(--spacing-lg);
                    border-radius: var(--radius-xl);
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 40, 0.4));
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .race-title {
                    text-align: center;
                    margin-bottom: var(--spacing-md);
                    font-size: var(--font-size-lg);
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .race-track {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs);
                }

                .race-lane {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .race-lane.current-player {
                    background: rgba(var(--color-primary-rgb), 0.15);
                    padding: var(--spacing-xs);
                    border-radius: var(--radius-md);
                    border: 2px solid var(--color-primary);
                }

                .lane-info {
                    display: flex;
                    gap: var(--spacing-xs);
                    align-items: center;
                    font-size: var(--font-size-xs);
                }

                .lane-rank {
                    font-weight: 800;
                    color: var(--color-primary);
                    min-width: 24px;
                    font-size: var(--font-size-xs);
                }

                .lane-name {
                    flex: 1;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: var(--font-size-xs);
                }

                .lane-score {
                    font-family: var(--font-mono);
                    color: var(--color-text-secondary);
                    font-size: var(--font-size-xs);
                    min-width: 60px;
                    text-align: right;
                }

                .lane-track {
                    position: relative;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-sm);
                    overflow: visible;
                }

                .runner {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2em;
                    transition: left 0.5s ease-out;
                    z-index: 2;
                }

                .finish-line {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    font-size: 1.5em;
                    display: flex;
                    align-items: center;
                    pointer-events: none;
                }

                @media (max-width: 768px) {
                    .live-race {
                        padding: var(--spacing-md);
                    }

                    .race-title {
                        font-size: var(--font-size-base);
                    }

                    .lane-track {
                        height: 20px;
                    }

                    .runner {
                        font-size: 1em;
                    }
                }
            `}</style>
        </div>
    );
};
