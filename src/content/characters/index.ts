import { kristen } from './kristen';
import { todd } from './todd';
import type { CharacterDefinition, CharacterId } from './types';

export const characters: Record<CharacterId, CharacterDefinition> = {
  todd,
  kristen,
};

export const characterList = [todd, kristen] as const;

export type { CharacterDefinition, CharacterId, MoveDefinition } from './types';

