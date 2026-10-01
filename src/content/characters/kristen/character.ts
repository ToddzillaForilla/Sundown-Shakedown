import type { CharacterDefinition } from '../types';
import { kristenMoves } from './moves';
import fighterUrl from './assets/sprites/kristen-concept-fighter.png';
import idleSheetUrl from './assets/sprites/kristen-idle-sheet-v1.png';
import portraitUrl from './assets/portraits/kristen-portrait.png';

export const kristen: CharacterDefinition = {
  id: 'kristen',
  displayName: 'Kristen',
  tagline: 'Rooted. Ready. Easily distracted.',
  themes: ['plants', 'cooking', 'camping'],
  art: {
    fighterTextureKey: 'fighter-kristen-concept',
    fighterUrl,
    portraitTextureKey: 'portrait-kristen',
    portraitUrl,
    idleSheet: {
      textureKey: 'fighter-kristen-idle-sheet-v1',
      animationKey: 'fighter-kristen-idle-v1',
      url: idleSheetUrl,
      frameWidth: 260,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 7,
    },
  },
  palette: {
    primary: 0x62b75a,
    secondary: 0x254f31,
    accent: 0xffb84d,
    skin: 0xf1b48c,
  },
  stats: {
    maxHealth: 1000,
    walkSpeed: 198,
    retreatSpeed: 158,
    jumpVelocity: 540,
  },
  moves: kristenMoves,
};

