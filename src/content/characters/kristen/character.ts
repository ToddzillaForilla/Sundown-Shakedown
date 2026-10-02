import type { CharacterDefinition } from '../types';
import { kristenMoves } from './moves';
import fighterUrl from './assets/sprites/kristen-concept-fighter.png';
import idleSheetUrl from './assets/sprites/kristen-idle-sheet-v1.png';
import walkSheetUrl from './assets/sprites/kristen-walk-sheet-v1-hands-free.png';
import kickAttackSheetUrl from './assets/sprites/kristen-kick-attack-sheet-v2.png';
import punchAttackSheetUrl from './assets/sprites/kristen-punch-attack-sheet-v3.png';
import reactionSheetUrl from './assets/sprites/kristen-reactions-sheet-v1.png';
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
    renderScale: 0.96,
    idleSheet: {
      textureKey: 'fighter-kristen-idle-sheet-v1',
      animationKey: 'fighter-kristen-idle-v1',
      url: idleSheetUrl,
      frameWidth: 260,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 7,
    },
    walkSheet: {
      textureKey: 'fighter-kristen-walk-sheet-v1-hands-free',
      animationKey: 'fighter-kristen-walk-v1-hands-free',
      url: walkSheetUrl,
      frameWidth: 260,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 10,
    },
    kickAttackSheet: {
      textureKey: 'fighter-kristen-kick-attack-sheet-v2',
      animationKey: 'fighter-kristen-kick-attack-v2',
      url: kickAttackSheetUrl,
      frameWidth: 320,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 22,
    },
    punchAttackSheet: {
      textureKey: 'fighter-kristen-punch-attack-sheet-v3',
      animationKey: 'fighter-kristen-punch-attack-v3',
      url: punchAttackSheetUrl,
      frameWidth: 320,
      frameHeight: 430,
      frameCount: 6,
      frameRate: 12,
    },
    reactionSheet: {
      textureKey: 'fighter-kristen-reactions-sheet-v1',
      url: reactionSheetUrl,
      frameWidth: 320,
      frameHeight: 362,
      frameCount: 6,
      block: {
        animationKey: 'fighter-kristen-block-v1',
        startFrame: 0,
        endFrame: 1,
        frameRate: 8,
        repeat: -1,
        yoyo: true,
      },
      hit: {
        animationKey: 'fighter-kristen-hit-v1',
        startFrame: 2,
        endFrame: 3,
        frameRate: 12,
      },
      landing: {
        animationKey: 'fighter-kristen-landing-v1',
        startFrame: 4,
        endFrame: 5,
        frameRate: 18,
      },
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

