import React, { useEffect, useState } from 'react';
import { getGlobalRankings } from '../utils/api';
import GlobalLeaderboard, { Player } from './GlobalLeaderboard';

interface RankingEntry {
  name: string;
  country: string;  // ideally 2-letter ISO code like "US", "AR"
  score: number;
  timestamp: string;
}

// Helper: 2-letter ISO country code -> flag emoji, or 🌍 as fallback
const getCountryFlag = (country?: string): string => {
  const code = (country || '').trim();

  // Only accept A–Z 2-letter codes
  if (/^[A-Za-z]{2}$/.test(code)) {
    const upper = code.toUpperCase();
    const codePoints = upper
      .split('')
      .map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65)); // 'A' -> 🇦

    return String.fromCodePoint(...codePoints);
  }

  // Safe, widely-supported fallback emoji
  return '🌍';
};

export const GlobalRanking: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const limit = 300;

    const fetchRankings = async () => {
      try {
        setIsLoading(true);

        const data: RankingEntry[] = await getGlobalRankings(limit);

        // Sort by score descending and assign place
        const sortedByScore = [...data].sort((a, b) => b.score - a.score);

        const mappedPlayers: Player[] = sortedByScore.map((entry, index) => ({
          place: index + 1,
          countryFlag: getCountryFlag(entry.country),
          nickname: entry.name,
          points: entry.score,
        }));

        setPlayers(mappedPlayers);
      } catch (err) {
        console.error('Failed to fetch global rankings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();

    const interval = setInterval(fetchRankings, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && players.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading global rankings...
      </div>
    );
  }

  return (
    <div className="mt-8">
      <GlobalLeaderboard players={players} />
    </div>
  );
};
