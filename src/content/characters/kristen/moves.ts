import type { CharacterDefinition } from '../types';

export const kristenMoves: CharacterDefinition['moves'] = {
  light: {
    id: 'pruning-strike',
    name: 'Pruning Strike',
    damage: 58,
    range: 76,
    cooldownMs: 275,
    meterGain: 9,
    kind: 'light',
  },
  heavy: {
    id: 'cast-iron-crush',
    name: 'Cast-Iron Crush',
    damage: 112,
    range: 82,
    cooldownMs: 550,
    meterGain: 15,
    kind: 'heavy',
  },
  special: {
    id: 'thorn-whip',
    name: 'Thorn Whip',
    damage: 138,
    range: 155,
    cooldownMs: 920,
    meterGain: 18,
    kind: 'special',
  },
  super: {
    id: 'wildfire-garden',
    name: 'Wildfire Garden',
    damage: 320,
    range: 205,
    cooldownMs: 1800,
    meterGain: 0,
    kind: 'super',
  },
};

