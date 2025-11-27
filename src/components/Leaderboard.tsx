'use client';

import React from 'react';
import { LeaderboardEntry } from '../utils/api';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentPlayerId?: string;
    winner?: LeaderboardEntry | null;
}

export default function Leaderboard({ entries, currentPlayerId, winner }: LeaderboardProps) {
    return (
        <div className="leaderboard">
            <h2 className="leaderboard-title">
                <span className="trophy-icon">🏆</span>
                Leaderboard
            </h2>

            {winner && (
                <div className="winner-announcement animate-scaleIn">
                    <div className="winner-badge">👑 Winner!</div>
                    <div className="winner-name">{winner.username}</div>
                    <div className="winner-score">{winner.bestScore} points</div>
                </div>
            )}

            <div className="leaderboard-list">
                {entries.map((entry, index) => (
                    <div
                        key={entry.playerId}
                        className={`leaderboard-entry ${entry.playerId === currentPlayerId ? 'current-player' : ''
                            } ${entry.isFinished ? 'finished' : 'playing'} animate-slideInUp`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="entry-rank">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div className="entry-info">
                            <div className="entry-name">
                                {entry.username}
                                {entry.playerId === currentPlayerId && <span className="you-badge">You</span>}
                            </div>
                            <div className="entry-progress">
                                {entry.completedRounds}/3 rounds
                                {entry.isFinished && <span className="finished-badge">✓ Done</span>}
                            </div>
                        </div>
                        <div className="entry-score">{entry.bestScore}</div>
                    </div>
                ))}

                {entries.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <div className="empty-text">Waiting for players...</div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          width: 100%;
          max-width: 400px;
        }

        .leaderboard-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin: 0;
        }

        .trophy-icon {
          font-size: var(--font-size-3xl);
          animation: bounce 2s ease-in-out infinite;
        }

        .winner-announcement {
          background: var(--gradient-primary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-xl);
          text-align: center;
          box-shadow: var(--shadow-glow);
        }

        .winner-badge {
          font-size: var(--font-size-sm);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: white;
          margin-bottom: var(--spacing-sm);
        }

        .winner-name {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          color: white;
          margin-bottom: var(--spacing-xs);
        }

        .winner-score {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .leaderboard-entry {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
        }

        .leaderboard-entry:hover {
          background: var(--color-bg-card-hover);
          transform: translateX(4px);
        }

        .leaderboard-entry.current-player {
          border-color: var(--color-primary);
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }

        .leaderboard-entry.finished {
          opacity: 0.9;
        }

        .entry-rank {
          font-size: var(--font-size-xl);
          font-weight: 700;
          min-width: 40px;
          text-align: center;
        }

        .entry-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .entry-name {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .you-badge {
          font-size: var(--font-size-xs);
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-primary);
          background: rgba(99, 102, 241, 0.2);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .entry-progress {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .finished-badge {
          font-size: var(--font-size-xs);
          color: var(--color-success);
          font-weight: 600;
        }

        .entry-score {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-primary);
          font-family: 'Courier New', monospace;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-3xl);
          gap: var(--spacing-md);
        }

        .empty-icon {
          font-size: var(--font-size-5xl);
          opacity: 0.5;
          animation: pulse 2s ease-in-out infinite;
        }

        .empty-text {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .leaderboard {
            max-width: 100%;
          }

          .leaderboard-title {
            font-size: var(--font-size-xl);
          }
        }
      `}</style>
        </div>
    );
}
