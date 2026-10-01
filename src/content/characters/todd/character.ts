import type { CharacterDefinition } from '../types';
import { toddMoves } from './moves';
import fighterUrl from './assets/sprites/todd-concept-fighter.png';
import idleSheetUrl from './assets/sprites/todd-idle-sheet-v2-laptop.png';
import walkSheetUrl from './assets/sprites/todd-walk-sheet-v2-laptop.png';
import portraitUrl from './assets/portraits/todd-portrait.png';

export const todd: CharacterDefinition = {
  id: 'todd',
  displayName: 'Todd',
  tagline: 'Hack. Grind. Respawn.',
  themes: ['hacking', 'video games', 'technology'],
  art: {
    fighterTextureKey: 'fighter-todd-concept',
    fighterUrl,
    portraitTextureKey: 'portrait-todd',
    portraitUrl,
    nativeFacing: -1,
    renderScale: 0.91,
    idleSheet: {
      textureKey: 'fighter-todd-idle-sheet-v2-laptop',
      animationKey: 'fighter-todd-idle-v2-laptop',
      url: idleSheetUrl,
      frameWidth: 260,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 6,
    },
    walkSheet: {
      textureKey: 'fighter-todd-walk-sheet-v2-laptop',
      animationKey: 'fighter-todd-walk-v2-laptop',
      url: walkSheetUrl,
      frameWidth: 260,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 10,
    },
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

