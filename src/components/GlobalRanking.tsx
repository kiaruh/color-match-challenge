import React, { useEffect, useState } from 'react';
import { getGlobalRankings, getCountryRankings } from '../utils/api';

interface RankingEntry {
  name: string;
  country: string;
  score: number;
  timestamp: string;
}

export const GlobalRanking: React.FC = () => {
  const [globalRankings, setGlobalRankings] = useState<RankingEntry[]>([]);
  const [countryRankings, setCountryRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Fetch global rankings (10 or 300 based on expand state)
        const limit = isExpanded ? 300 : 10;
        const global = await getGlobalRankings(limit);
        setGlobalRankings(global);

        // Detect user country from IP (simple client-side detection)
        try {
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();
          if (ipData.country_code) {
            const countryFlag = getCountryFlag(ipData.country_code);
            setUserCountry(countryFlag);

            // Fetch country-specific rankings
            const country = await getCountryRankings(countryFlag, limit);
            setCountryRankings(country);
          }
        } catch (err) {
          console.error('Failed to detect country:', err);
        }
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
  }, [isExpanded]);

  const getCountryFlag = (countryCode: string): string => {
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderRankingList = (rankings: RankingEntry[], title: string) => (
    <div className="ranking-section">
      <h3 className="ranking-title">{title}</h3>
      <div className="ranking-list">
        {isLoading ? (
          <div className="loading-text">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="empty-text">No ranked players yet. Be the first!</div>
        ) : (
          rankings.map((player, index) => {
            const isTopThree = index < 3;
            const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

            return (
              <div key={index} className={`ranking-item ${isTopThree ? 'top-three' : ''}`}>
                <div className="rank-badge" style={{ backgroundColor: isTopThree ? rankColors[index] : 'transparent' }}>
                  <span className="rank-number">{index + 1}</span>
                </div>
                <span className="country-flag">{player.country}</span>
                <span className="player-name">{player.name}</span>
                <span className="game-date">{formatDate(player.timestamp)}</span>
                <div className="score-display">
                  <span className="score-value">{player.score.toLocaleString()}</span>
                  <span className="score-label">PTS</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="global-ranking glass">
      {renderRankingList(globalRankings, '🌍 Global Rankings')}

      {userCountry && countryRankings.length > 0 && (
        <>
          <div className="divider"></div>
          {renderRankingList(countryRankings, `${userCountry} Country Rankings`)}
        </>
      )}

      <button
        className="expand-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '📊 Show Top 10' : '📈 Show Top 300'}
      </button>

      <style jsx>{`
        .global-ranking {
          padding: var(--spacing-2xl);
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 40, 0.4));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: var(--spacing-2xl);
          width: 100%;
          max-width: 800px;
        }

        .ranking-section {
          margin-bottom: var(--spacing-xl);
        }

        .ranking-title {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          margin-bottom: var(--spacing-lg);
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.5px;
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          min-height: 60px;
        }

        .ranking-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(4px);
        }

        .ranking-item.top-three {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          border-color: rgba(255, 255, 255, 0.2);
        }

        .rank-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          border: 2px solid rgba(255, 255, 255, 0.2);
          font-weight: 800;
          font-size: var(--font-size-base);
          flex-shrink: 0;
        }

        .rank-number {
          color: #000;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .ranking-item:not(.top-three) .rank-badge {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .ranking-item:not(.top-three) .rank-number {
          color: var(--color-text-primary);
          text-shadow: none;
        }

        .country-flag {
          font-size: var(--font-size-xl);
          flex-shrink: 0;
        }

        .player-name {
          flex: 1;
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }

        .game-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          opacity: 0.7;
          flex-shrink: 0;
          min-width: 90px;
          text-align: right;
        }

        .score-display {
          display: flex;
          align-items: baseline;
          gap: var(--spacing-xs);
          flex-shrink: 0;
          min-width: 110px;
          justify-content: flex-end;
        }

        .score-value {
          font-size: var(--font-size-xl);
          font-weight: 800;
          font-family: var(--font-mono);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .score-label {
          font-size: var(--font-size-xs);
          font-weight: 700;
          color: var(--color-text-secondary);
          letter-spacing: 0.5px;
        }

        .loading-text,
        .empty-text {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--color-text-secondary);
          font-size: var(--font-size-base);
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          margin: var(--spacing-2xl) 0;
        }

        .expand-button {
          width: 100%;
          padding: var(--spacing-md);
          margin-top: var(--spacing-lg);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          color: var(--color-text-primary);
          font-size: var(--font-size-base);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expand-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .global-ranking {
            padding: var(--spacing-lg);
          }

          .ranking-item {
            padding: var(--spacing-sm) var(--spacing-md);
            min-height: 60px;
          }

          .rank-badge {
            min-width: 40px;
            height: 40px;
            font-size: var(--font-size-base);
          }

          .player-name {
            font-size: var(--font-size-base);
          }

          .score-value {
            font-size: var(--font-size-xl);
          }

          .score-display {
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  );
};
