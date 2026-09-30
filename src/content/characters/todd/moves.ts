import type { CharacterDefinition } from '../types';

export const toddMoves: CharacterDefinition['moves'] = {
  light: {
    id: 'kickflip-jab',
    name: 'Kickflip Jab',
    damage: 55,
    range: 72,
    cooldownMs: 260,
    meterGain: 9,
    kind: 'light',
  },
  heavy: {
    id: 'deck-slam',
    name: 'Deck Slam',
    damage: 105,
    range: 88,
    cooldownMs: 520,
    meterGain: 14,
    kind: 'heavy',
  },
  special: {
    id: 'glitch-grind',
    name: 'Glitch Grind',
    damage: 145,
    range: 138,
    cooldownMs: 900,
    meterGain: 18,
    kind: 'special',
  },
  super: {
    id: 'system-crash',
    name: 'System Crash',
    damage: 310,
    range: 190,
    cooldownMs: 1800,
    meterGain: 0,
    kind: 'super',
  },
};

