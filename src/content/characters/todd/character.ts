import type { CharacterDefinition } from '../types';
import { toddMoves } from './moves';
import fighterUrl from './assets/sprites/todd-concept-fighter.png';
import portraitUrl from './assets/portraits/todd-portrait.png';

export const todd: CharacterDefinition = {
  id: 'todd',
  displayName: 'Todd',
  tagline: 'Hack. Grind. Respawn.',
  themes: ['hacking', 'video games', 'skateboarding'],
  art: {
    fighterTextureKey: 'fighter-todd-concept',
    fighterUrl,
    portraitTextureKey: 'portrait-todd',
    portraitUrl,
  },
  palette: {
    primary: 0x3d7eff,
    secondary: 0x172d63,
    accent: 0x65f5d2,
    skin: 0xf1b48c,
  },
  stats: {
    maxHealth: 1000,
    walkSpeed: 210,
    retreatSpeed: 165,
    jumpVelocity: 555,
  },
  moves: toddMoves,
};

