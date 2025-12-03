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
          rankings.map((player, index) => (
            <div key={index} className="ranking-item">
              <span className="rank">#{index + 1}</span>
              <span className="country">{player.country}</span>
              <span className="name">{player.name}</span>
              <span className="score">{player.score.toLocaleString()}</span>
              <span className="date">{formatDate(player.timestamp)}</span>
            </div>
          ))
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
          padding: var(--spacing-lg);
          border-radius: var(--radius-xl);
          background: rgba(0, 0, 0, 0.2);
          margin-top: var(--spacing-2xl);
          width: 100%;
          max-width: 600px;
        }

        .ranking-section {
          margin-bottom: var(--spacing-lg);
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
          max-height: ${isExpanded ? '600px' : 'none'};
          overflow-y: ${isExpanded ? 'auto' : 'visible'};
        }

        .ranking-item {
          display: grid;
          grid-template-columns: 40px 40px 1fr 80px 100px;
          align-items: center;
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          gap: var(--spacing-sm);
        }

        .rank {
          font-weight: bold;
          color: var(--color-primary);
          font-size: var(--font-size-sm);
        }

        .country {
          font-size: 1.2em;
        }

        .name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .score {
          font-family: var(--font-mono);
          color: var(--color-text-secondary);
          text-align: right;
        }

        .date {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          text-align: right;
        }

        .loading-text, .empty-text {
          text-align: center;
          color: var(--color-text-secondary);
          padding: var(--spacing-md);
          font-style: italic;
        }

        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: var(--spacing-lg) 0;
        }

        .expand-button {
          width: 100%;
          padding: var(--spacing-sm);
          margin-top: var(--spacing-md);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .expand-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
