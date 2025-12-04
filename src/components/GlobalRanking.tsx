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
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      const limit = isExpanded ? 300 : 10;

      // 1. Fetch Global Rankings immediately
      setIsLoadingGlobal(true);
      getGlobalRankings(limit)
        .then(data => {
          setGlobalRankings(data);
          setIsLoadingGlobal(false);
        })
        .catch(err => {
          console.error('Failed to fetch global rankings:', err);
          setIsLoadingGlobal(false);
        });

      // 2. Fetch Country Rankings (independent)
      // We only need to detect country once, but we need to fetch rankings on refresh
      const detectAndFetchCountry = async () => {
        try {
          let countryFlag = userCountry;

          if (!countryFlag) {
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData = await ipResponse.json();
            if (ipData.country_code) {
              countryFlag = getCountryFlag(ipData.country_code);
              setUserCountry(countryFlag);
            }
          }

          if (countryFlag) {
            setIsLoadingCountry(true);
            const countryData = await getCountryRankings(countryFlag, limit);
            setCountryRankings(countryData);
            setIsLoadingCountry(false);
          }
        } catch (err) {
          console.error('Failed to fetch country rankings:', err);
          setIsLoadingCountry(false);
        }
      };

      detectAndFetchCountry();
    };

    fetchRankings();

    const interval = setInterval(fetchRankings, 60000);
    return () => clearInterval(interval);
  }, [isExpanded]); // We don't include userCountry to avoid loops, handled inside

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

  const renderRankingList = (rankings: RankingEntry[], title: string, loading: boolean) => (
    <div className="ranking-section">
      <h3 className="ranking-title">{title}</h3>
      <div className="weekly-label">Weekly Rankings - Resets Every Monday</div>
      <div className="ranking-list">
        {loading ? (
          <div className="loading-text">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="empty-text">No ranked players this week. Be the first!</div>
        ) : (
          rankings.map((player, index) => {
            const isTopThree = index < 3;
            const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

            return (
              <div key={index} className={`ranking-item ${isTopThree ? 'top-three' : ''}`}>
                <div className="rank-badge" style={{ backgroundColor: isTopThree ? rankColors[index] : 'transparent' }}>
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <span className="country-flag">{player.country}</span>
                <span className="player-name">{player.name}</span>
                <div className="spacer"></div>
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
      {renderRankingList(globalRankings, '🌍 Global Rankings', isLoadingGlobal)}

      {userCountry && (
        <>
          <div className="divider"></div>
          {renderRankingList(countryRankings, `${userCountry} Country Rankings`, isLoadingCountry)}
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
          margin-bottom: var(--spacing-xs);
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.5px;
        }

        .weekly-label {
          text-align: center;
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          margin-bottom: var(--spacing-lg);
          opacity: 0.8;
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
          min-width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          border: 2px solid rgba(255, 255, 255, 0.2);
          font-weight: 800;
          font-size: var(--font-size-sm);
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
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .spacer {
          flex: 1;
        }

        .score-display {
          display: flex;
          align-items: baseline;
          gap: var(--spacing-xs);
          flex-shrink: 0;
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
            gap: var(--spacing-sm);
          }

          .rank-badge {
            min-width: 32px;
            height: 32px;
            font-size: var(--font-size-xs);
          }

          .player-name {
            font-size: var(--font-size-sm);
            max-width: 120px;
          }

          .score-value {
            font-size: var(--font-size-lg);
          }
        }
      `}</style>
    </div>
  );
};
