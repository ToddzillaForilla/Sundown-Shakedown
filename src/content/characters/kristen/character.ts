import type { CharacterDefinition } from '../types';
import { kristenMoves } from './moves';
import fighterUrl from './assets/sprites/kristen-concept-fighter.png';
import idleSheetUrl from './assets/sprites/kristen-idle-retro-v1.png';
import jumpSheetUrl from './assets/sprites/kristen-jump-v1.png';
import crouchSheetUrl from './assets/sprites/kristen-crouch-v1.png';
import blockSheetUrl from './assets/sprites/kristen-block-v2.png';
import hitSheetUrl from './assets/sprites/kristen-hit-v2.png';
import defeatSheetUrl from './assets/sprites/kristen-ko-v1.png';
import walkSheetUrl from './assets/sprites/kristen-walk-direction-combo-v1.png';
import kickAttackSheetUrl from './assets/sprites/kristen-kick-attack-sheet-v2.png';
import punchMainAttackSheetUrl from './assets/sprites/kristen-punch-main-75-1792159772322.png';
import punchAltAttackSheetUrl from './assets/sprites/kristen-punch-alt-25-1792159502161.png';
import reactionSheetUrl from './assets/sprites/kristen-reactions-sheet-v1.png';
import portraitUrl from './assets/portraits/kristen-fighter-card-v1.png';

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
      textureKey: 'fighter-kristen-idle-retro-v1',
      animationKey: 'fighter-kristen-idle-retro-v1',
      url: idleSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 5,
      frameRate: 6,
    },
    jumpSheet: {
      textureKey: 'fighter-kristen-jump-v1',
      animationKey: 'fighter-kristen-jump-v1',
      url: jumpSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      frameRate: 7,
    },
    crouchSheet: {
      textureKey: 'fighter-kristen-crouch-v1',
      animationKey: 'fighter-kristen-crouch-v1',
      url: crouchSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      frameRate: 6,
    },
    crouchHoldFrame: 4,
    blockSheet: {
      textureKey: 'fighter-kristen-block-v2',
      animationKey: 'fighter-kristen-block-v2',
      url: blockSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      frameRate: 6,
    },
    blockHoldFrame: 4,
    hitSheet: {
      textureKey: 'fighter-kristen-hit-v2',
      animationKey: 'fighter-kristen-hit-v2',
      url: hitSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      // Fit the authored recoil within the existing 180 ms presentation window.
      frameRate: 39,
    },
    defeatSheet: {
      textureKey: 'fighter-kristen-ko-v1',
      animationKey: 'fighter-kristen-ko-v1',
      url: defeatSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      frameRate: 12,
    },
    walkSheet: {
      textureKey: 'fighter-kristen-walk-direction-combo-v1',
      animationKey: 'fighter-kristen-walk-right-retro-v1',
      url: walkSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 10,
    },
    walkLeftSheet: {
      textureKey: 'fighter-kristen-walk-direction-combo-v1',
      animationKey: 'fighter-kristen-walk-left-retro-v1',
      url: walkSheetUrl,
      frameOrder: [0, 8, 7, 6, 5, 4, 3, 2, 1],
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
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
      textureKey: 'fighter-kristen-punch-main-75-v1',
      animationKey: 'fighter-kristen-punch-main-75-v1',
      url: punchMainAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      frameRate: 24,
    },
    alternatePunchAttackSheet: {
      textureKey: 'fighter-kristen-punch-alt-25-v1',
      animationKey: 'fighter-kristen-punch-alt-25-v1',
      url: punchAltAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 7,
      frameRate: 24,
    },
    alternatePunchChance: 0.25,
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

