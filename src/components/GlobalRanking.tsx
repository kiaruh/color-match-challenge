import React, { useEffect, useState } from 'react';
import { getGlobalRankings } from '../utils/api';
import GlobalLeaderboard, { Player } from './GlobalLeaderboard';

interface RankingEntry {
  name: string;
  country: string;
  score: number;
  timestamp: string;
}

export const GlobalRanking: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      // Fetch enough players to support the "Show Top 300" feature
      const limit = 300;

      setIsLoading(true);
      getGlobalRankings(limit)
        .then(data => {
          // Map API data to Player interface
          const mappedPlayers: Player[] = data.map((entry: RankingEntry, index: number) => ({
            place: index + 1,
            countryCode: entry.country || 'US', // Default to US if missing, or handle gracefully
            nickname: entry.name,
            points: entry.score
          }));
          setPlayers(mappedPlayers);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch global rankings:', err);
          setIsLoading(false);
        });
    };

    fetchRankings();

    const interval = setInterval(fetchRankings, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && players.length === 0) {
    return <div className="text-center p-8 text-gray-400">Loading global rankings...</div>;
  }

  return (
    <div className="mt-8">
      <GlobalLeaderboard players={players} />
    </div>
  );
};
