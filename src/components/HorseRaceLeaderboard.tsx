import React from 'react';
import { LeaderboardEntry } from '../utils/api';

interface HorseRaceLeaderboardProps {
    leaderboard: LeaderboardEntry[];
    currentTurnPlayerId?: string | null;
}

export const HorseRaceLeaderboard: React.FC<HorseRaceLeaderboardProps> = ({ leaderboard, currentTurnPlayerId }) => {
    // Find max score to normalize progress
    const maxScore = Math.max(...leaderboard.map(p => p.totalScore), 1000); // Minimum 1000 for scale

    return (
        <div className="horse-race-track glass">
            <div className="finish-line">🏁</div>
            {leaderboard.map((player, index) => {
                const progress = Math.min((player.totalScore / maxScore) * 90, 90); // Cap at 90%
                const isCurrentTurn = player.playerId === currentTurnPlayerId;

                return (
                    <div key={player.playerId} className={`track-lane ${isCurrentTurn ? 'active-lane' : ''}`}>
                        <div className="player-info">
                            <span className="rank">#{index + 1}</span>
                            <span className="name">{player.username}</span>
                            <span className="score">{player.totalScore}pts</span>
                        </div>
                        <div
                            className="horse-avatar"
                            style={{ left: `${progress}%` }}
                        >
                            <div className="avatar-icon">
                                {['🦄', '🐎', '🦓', '🦒', '🐅', '🐆'][index % 6]}
                            </div>
                            {isCurrentTurn && <div className="turn-indicator">👇</div>}
                        </div>
                    </div>
                );
            })}

            <style jsx>{`
        .horse-race-track {
          position: relative;
          width: 100%;
          padding: var(--spacing-lg);
          margin: var(--spacing-xl) 0;
          background: linear-gradient(90deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .finish-line {
          position: absolute;
          right: 5%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: repeating-linear-gradient(
            0deg,
            #000,
            #000 10px,
            #fff 10px,
            #fff 20px
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          z-index: 1;
        }

        .track-lane {
          position: relative;
          height: 60px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding-left: 120px; /* Space for player info */
        }

        .track-lane:last-child {
          border-bottom: none;
        }

        .active-lane {
          background: rgba(255, 255, 255, 0.05);
        }

        .player-info {
          position: absolute;
          left: var(--spacing-md);
          display: flex;
          flex-direction: column;
          width: 100px;
          z-index: 2;
        }

        .rank {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
        }

        .name {
          font-weight: bold;
          font-size: var(--font-size-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .score {
          font-size: var(--font-size-xs);
          color: var(--color-primary);
        }

        .horse-avatar {
          position: absolute;
          transition: left 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-size: 32px;
          transform: translateX(-50%);
          z-index: 2;
        }

        .turn-indicator {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }
      `}</style>
        </div>
    );
};
