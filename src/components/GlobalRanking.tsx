import React, { useEffect, useState } from 'react';
import { getGlobalRankings } from '../utils/api';

interface RankingEntry {
  name: string;
  country: string;
  score: number;
}

export const GlobalRanking: React.FC = () => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await getGlobalRankings();
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();

    // Refresh every minute
    const interval = setInterval(fetchRankings, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="global-ranking glass">
      <h3 className="ranking-title">🌍 Top Players (Avg Score)</h3>
      <div className="ranking-list">
        {isLoading ? (
          <div className="loading-text">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="empty-text">No ranked players yet. Be the first!</div>
        ) : (
          rankings.map((player, index) => (
            <div key={index} className="ranking-item">
              <span className="rank">#{index + 1}</span>
              <span className="country">{player.country}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.score.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .global-ranking {
          padding: var(--spacing-lg);
          border-radius: var(--radius-xl);
          background: rgba(0, 0, 0, 0.2);
          margin-top: var(--spacing-2xl);
          width: 100%;
          max-width: 400px;
        }

        .ranking-title {
          font-size: var(--font-size-lg);
          font-weight: bold;
          margin-bottom: var(--spacing-md);
          text-align: center;
          color: var(--color-text-primary);
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .ranking-item {
          display: flex;
          align-items: center;
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          gap: var(--spacing-md);
        }

        .rank {
          font-weight: bold;
          color: var(--color-primary);
          width: 30px;
        }

        .country {
          font-size: 1.2em;
        }

        .name {
          flex: 1;
          font-weight: 500;
        }

        .score {
          font-family: var(--font-mono);
          color: var(--color-text-secondary);
        }

        .loading-text, .empty-text {
          text-align: center;
          color: var(--color-text-secondary);
          padding: var(--spacing-md);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
