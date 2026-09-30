import type { CharacterId } from '../content/characters/types';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameSession {
  playerCharacter: CharacterId;
  difficulty: Difficulty;
}

export const gameSession: GameSession = {
  playerCharacter: 'todd',
  difficulty: 'normal',
};

