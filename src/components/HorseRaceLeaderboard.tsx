'use client';

import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, getSoloRankings } from '../utils/api';

interface HorseRaceLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentTurnPlayerId?: string | null;
  isSoloMode?: boolean;
  currentScore?: number;
  playerName?: string;
}

interface GhostRacer {
  name: string;
  score: number;
  isGhost: true;
}

type RaceParticipant = (LeaderboardEntry & { isGhost?: false }) | GhostRacer;

export const HorseRaceLeaderboard: React.FC<HorseRaceLeaderboardProps> = ({
  leaderboard,
  currentTurnPlayerId,
  isSoloMode = false,
  currentScore = 0,
  playerName = 'You'
}) => {
  const [ghostRankings, setGhostRankings] = useState<GhostRacer[]>([]);
  const [isLoadingGhosts, setIsLoadingGhosts] = useState(isSoloMode);

  // Fetch ghost rankings for solo mode
  useEffect(() => {
    if (!isSoloMode) return;

    const fetchGhosts = async () => {
      try {
        const rankings = await getSoloRankings(10);
        const ghosts: GhostRacer[] = rankings.map(r => ({
          name: r.name,
          score: r.score,
          isGhost: true as const
        }));
        setGhostRankings(ghosts);
      } catch (error) {
        console.error('Failed to fetch ghost rankings:', error);
      } finally {
        setIsLoadingGhosts(false);
      }
    };

    fetchGhosts();
  }, [isSoloMode]);

  // Prepare race participants
  const participants: RaceParticipant[] = isSoloMode
    ? [
      // Current player in solo mode
      {
        playerId: 'solo-player',
        username: `${playerName} (You)`,
        totalScore: currentScore,
        bestScore: currentScore,
        completedRounds: 0,
        isFinished: false,
        isWaiting: false,
        isGhost: false as const
      },
      ...ghostRankings
    ].sort((a, b) => {
      const scoreA = 'totalScore' in a ? a.totalScore : a.score;
      const scoreB = 'totalScore' in b ? b.totalScore : b.score;
      return scoreB - scoreA;
    })
    : leaderboard;

  // Find max score to normalize progress
  const maxScore = Math.max(
    ...participants.map(p => {
      const score = 'totalScore' in p ? p.totalScore : p.score;
      return score;
    }),
    1000
  );

  if (isSoloMode && isLoadingGhosts) {
    return (
      <div className="horse-race-track glass">
        <div className="loading-state">Loading rankings...</div>
        <style jsx>{`
                    .horse-race-track {
                        padding: var(--spacing-lg);
                        border-radius: var(--radius-xl);
                        background: rgba(0, 0, 0, 0.3);
                        min-height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .loading-state {
                        color: var(--color-text-secondary);
                    }
                `}</style>
      </div>
    );
  }

  return (
    <div className="horse-race-track glass">
      {isSoloMode && <h3 className="race-title">🏁 Live Rankings</h3>}
      <div className="finish-line">🏁</div>
      {participants.slice(0, isSoloMode ? 11 : undefined).map((participant, index) => {
        const score = 'totalScore' in participant ? participant.totalScore : participant.score;
        const progress = Math.min((score / maxScore) * 90, 90);
        const isCurrentPlayer = 'playerId' in participant && participant.playerId === 'solo-player';
        const isCurrentTurn = 'playerId' in participant && participant.playerId === currentTurnPlayerId;
        const isGhost = 'isGhost' in participant && participant.isGhost;
        const name = 'username' in participant ? participant.username : participant.name;

        // Icon selection
        let icon: string;
        if (isSoloMode) {
          icon = isCurrentPlayer ? '🎯' : '🏃';
        } else {
          icon = ['🦄', '🐎', '🦓', '🦒', '🐅', '🐆'][index % 6];
        }

        return (
          <div
            key={'playerId' in participant ? participant.playerId : `ghost-${index}`}
            className={`track-lane ${isCurrentTurn ? 'active-lane' : ''} ${isCurrentPlayer ? 'current-player' : ''}`}
          >
            <div className="player-info">
              <span className="rank">#{index + 1}</span>
              <span className="name">{name}</span>
              <span className="score">{score.toLocaleString()}{isSoloMode ? '' : 'pts'}</span>
            </div>
            <div className="lane-track">
              <div
                className="horse-avatar"
                style={{ left: `${progress}%` }}
              >
                <div className="avatar-icon">{icon}</div>
                {isCurrentTurn && <div className="turn-indicator">👇</div>}
              </div>
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

        .current-player {
          background: rgba(99, 102, 241, 0.15);
          border: 2px solid var(--color-primary);
          border-radius: var(--radius-md);
        }

        .lane-track {
          position: relative;
          height: 24px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          overflow: visible;
          flex: 1;
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
