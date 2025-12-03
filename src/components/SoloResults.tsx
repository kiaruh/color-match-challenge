'use client';

import React, { useEffect, useState } from 'react';
import { getSoloRankings, getPlayerSoloRank } from '../utils/api';

interface SoloResultsProps {
    username: string;
    totalScore: number;
    completedRounds: number;
    onPlayAgain: () => void;
}

interface RankingEntry {
    name: string;
    score: number;
    rounds: number;
    timestamp: string;
}

export const SoloResults: React.FC<SoloResultsProps> = ({ username, totalScore, completedRounds, onPlayAgain }) => {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [playerRank, setPlayerRank] = useState<{ rank: number; total: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rankingsData, rankData] = await Promise.all([
                    getSoloRankings(10),
                    getPlayerSoloRank(username, totalScore)
                ]);
                setRankings(rankingsData);
                setPlayerRank(rankData);
            } catch (error) {
                console.error('Failed to fetch solo results:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [username, totalScore]);

    const getPlayerPosition = (score: number): number => {
        // Calculate position based on score (0-100%)
        const maxScore = rankings.length > 0 ? rankings[0].score : totalScore;
        return Math.max(0, Math.min(100, (score / maxScore) * 100));
    };

    const isPlayerInTop10 = rankings.some(r => r.name === username && r.score === totalScore);

    return (
        <div className="solo-results">
            <div className="results-header">
                <h2>🎉 Game Complete!</h2>
                <div className="player-score">
                    <div className="score-label">Your Score</div>
                    <div className="score-value">{totalScore.toLocaleString()}</div>
                    <div className="rounds-info">{completedRounds} rounds completed</div>
                </div>
                {playerRank && (
                    <div className="rank-info">
                        Rank: <span className="rank-number">#{playerRank.rank}</span> out of {playerRank.total} players
                    </div>
                )}
            </div>

            <div className="horse-race-container">
                <h3>🏆 Top 10 Rankings</h3>
                {isLoading ? (
                    <div className="loading">Loading rankings...</div>
                ) : (
                    <div className="race-track">
                        {rankings.map((entry, index) => {
                            const isCurrentPlayer = entry.name === username && entry.score === totalScore;
                            const position = getPlayerPosition(entry.score);

                            return (
                                <div
                                    key={index}
                                    className={`race-lane ${isCurrentPlayer ? 'current-player' : ''}`}
                                >
                                    <div className="lane-info">
                                        <span className="lane-rank">#{index + 1}</span>
                                        <span className="lane-name">{entry.name}</span>
                                        <span className="lane-score">{entry.score.toLocaleString()}</span>
                                    </div>
                                    <div className="lane-track">
                                        <div
                                            className="runner"
                                            style={{
                                                left: `${position}%`,
                                                animationDelay: `${index * 0.1}s`
                                            }}
                                        >
                                            {isCurrentPlayer ? '🎯' : '🏃'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {!isPlayerInTop10 && (
                            <div className="race-lane current-player">
                                <div className="lane-info">
                                    <span className="lane-rank">#{playerRank?.rank || '?'}</span>
                                    <span className="lane-name">{username} (You)</span>
                                    <span className="lane-score">{totalScore.toLocaleString()}</span>
                                </div>
                                <div className="lane-track">
                                    <div
                                        className="runner"
                                        style={{
                                            left: `${getPlayerPosition(totalScore)}%`,
                                            animationDelay: '0s'
                                        }}
                                    >
                                        🎯
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="finish-line">🏁</div>
                    </div>
                )}
            </div>

            <button className="play-again-btn" onClick={onPlayAgain}>
                🎮 Play Again
            </button>

            <style jsx>{`
                .solo-results {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2xl);
                    padding: var(--spacing-2xl);
                    max-width: 800px;
                    margin: 0 auto;
                }

                .results-header {
                    text-align: center;
                }

                .results-header h2 {
                    font-size: var(--font-size-3xl);
                    margin-bottom: var(--spacing-lg);
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .player-score {
                    background: rgba(255, 255, 255, 0.05);
                    padding: var(--spacing-xl);
                    border-radius: var(--radius-xl);
                    margin-bottom: var(--spacing-md);
                }

                .score-label {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin-bottom: var(--spacing-xs);
                }

                .score-value {
                    font-size: var(--font-size-4xl);
                    font-weight: 800;
                    color: var(--color-primary);
                    font-family: var(--font-mono);
                }

                .rounds-info {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin-top: var(--spacing-xs);
                }

                .rank-info {
                    font-size: var(--font-size-lg);
                    color: var(--color-text-primary);
                }

                .rank-number {
                    font-weight: 800;
                    color: var(--color-primary);
                    font-size: var(--font-size-xl);
                }

                .horse-race-container {
                    background: rgba(0, 0, 0, 0.2);
                    padding: var(--spacing-xl);
                    border-radius: var(--radius-xl);
                }

                .horse-race-container h3 {
                    text-align: center;
                    margin-bottom: var(--spacing-lg);
                    font-size: var(--font-size-xl);
                }

                .loading {
                    text-align: center;
                    color: var(--color-text-secondary);
                    padding: var(--spacing-xl);
                }

                .race-track {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }

                .race-lane {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xs);
                }

                .race-lane.current-player {
                    background: rgba(var(--color-primary-rgb), 0.1);
                    padding: var(--spacing-sm);
                    border-radius: var(--radius-md);
                    border: 2px solid var(--color-primary);
                }

                .lane-info {
                    display: flex;
                    gap: var(--spacing-sm);
                    align-items: center;
                    font-size: var(--font-size-sm);
                }

                .lane-rank {
                    font-weight: 800;
                    color: var(--color-primary);
                    min-width: 30px;
                }

                .lane-name {
                    flex: 1;
                    font-weight: 500;
                }

                .lane-score {
                    font-family: var(--font-mono);
                    color: var(--color-text-secondary);
                }

                .lane-track {
                    position: relative;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }

                .runner {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.5em;
                    animation: runIn 1.5s ease-out forwards;
                    transition: left 0.5s ease-out;
                }

                @keyframes runIn {
                    from {
                        left: -50px;
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .finish-line {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    font-size: 2em;
                    display: flex;
                    align-items: center;
                }

                .play-again-btn {
                    padding: var(--spacing-md) var(--spacing-2xl);
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-full);
                    font-size: var(--font-size-lg);
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    align-self: center;
                }

                .play-again-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
            `}</style>
        </div>
    );
};
