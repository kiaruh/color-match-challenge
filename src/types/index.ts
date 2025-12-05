export type GamePhase = 'landing' | 'playing' | 'waiting' | 'solo_results';

export interface GameState {
    phase: GamePhase;
    currentRound: number;
    targetColor: string;
    isSinglePlayer: boolean;
    singlePlayerScore: number;
}
