import type { CharacterDefinition } from '../types';
import { toddMoves } from './moves';
import fighterUrl from './assets/sprites/todd-concept-fighter.png';
import idleSheetUrl from './assets/sprites/todd-idle-hands-free-v1.png';
import walkSheetUrl from './assets/sprites/todd-walk-hands-free-v1.png';
import jumpSheetUrl from './assets/sprites/todd-jump-v1.png';
import landingSheetUrl from './assets/sprites/todd-jump-recovery-v1.png';
import crouchSheetUrl from './assets/sprites/todd-crouch-retro-v1.png';
import airKickAttackSheetUrl from './assets/sprites/todd-jump-kick-retro-v1.png';
import airPunchAttackSheetUrl from './assets/sprites/todd-jump-punch-retro-v1.png';
import blockSheetUrl from './assets/sprites/todd-block-v1.png';
import kickAttackSheetUrl from './assets/sprites/todd-kick-retro-v1.png';
import punchAttackSheetUrl from './assets/sprites/todd-punch-left-75-v1.png';
import alternatePunchAttackSheetUrl from './assets/sprites/todd-punch-right-25-v1.png';
import crouchPunchAttackSheetUrl from './assets/sprites/todd-crouch-punch-attack-sheet-v1.png';
import hitSheetUrl from './assets/sprites/todd-hit-reaction-v1.png';
import defeatSheetUrl from './assets/sprites/todd-defeat-ko-v1.png';
import reactionSheetUrl from './assets/sprites/todd-reactions-sheet-v1.png';
import portraitUrl from './assets/portraits/todd-fighter-card-v3-facing-right.png';

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
      textureKey: 'fighter-todd-idle-hands-free-v1',
      animationKey: 'fighter-todd-idle-hands-free-v1',
      url: idleSheetUrl,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 5,
      frameRate: 6,
    },
    walkSheet: {
      textureKey: 'fighter-todd-walk-hands-free-v1',
      animationKey: 'fighter-todd-walk-hands-free-v1',
      url: walkSheetUrl,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 15,
    },
    jumpSheet: {
      textureKey: 'fighter-todd-jump-v1',
      animationKey: 'fighter-todd-jump-v1',
      url: jumpSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 8.5,
    },
    landingSheet: {
      textureKey: 'fighter-todd-jump-recovery-v1',
      animationKey: 'fighter-todd-jump-recovery-v1',
      url: landingSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 4,
      frameRate: 18,
    },
    crouchSheet: {
      textureKey: 'fighter-todd-crouch-retro-v1',
      animationKey: 'fighter-todd-crouch-retro-v1',
      url: crouchSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 5,
      frameRate: 6,
    },
    crouchHoldFrame: 2,
    airKickAttackSheet: {
      textureKey: 'fighter-todd-jump-kick-retro-v1',
      animationKey: 'fighter-todd-jump-kick-retro-v1',
      url: airKickAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 27,
    },
    airPunchAttackSheet: {
      textureKey: 'fighter-todd-jump-punch-retro-v1',
      animationKey: 'fighter-todd-jump-punch-retro-v1',
      url: airPunchAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 15,
    },
    blockSheet: {
      textureKey: 'fighter-todd-block-v1',
      animationKey: 'fighter-todd-block-v1',
      url: blockSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 5,
      frameRate: 6,
    },
    blockHoldFrame: 2,
    kickAttackSheet: {
      textureKey: 'fighter-todd-kick-retro-v1',
      animationKey: 'fighter-todd-kick-retro-v1',
      url: kickAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 33,
    },
    punchAttackSheet: {
      textureKey: 'fighter-todd-punch-left-75-v1',
      animationKey: 'fighter-todd-punch-left-75-v1',
      url: punchAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 24,
    },
    alternatePunchAttackSheet: {
      textureKey: 'fighter-todd-punch-right-25-v1',
      animationKey: 'fighter-todd-punch-right-25-v1',
      url: alternatePunchAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 24,
    },
    alternatePunchChance: 0.25,
    crouchPunchAttackSheet: {
      textureKey: 'fighter-todd-crouch-punch-attack-sheet-v1',
      animationKey: 'fighter-todd-crouch-punch-attack-v1',
      url: crouchPunchAttackSheetUrl,
      nativeFacing: 1,
      frameWidth: 320,
      frameHeight: 430,
      frameCount: 6,
      frameRate: 12,
    },
    hitSheet: {
      textureKey: 'fighter-todd-hit-reaction-v1',
      animationKey: 'fighter-todd-hit-reaction-v1',
      url: hitSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 24,
    },
    defeatSheet: {
      textureKey: 'fighter-todd-defeat-ko-v1',
      animationKey: 'fighter-todd-defeat-ko-v1',
      url: defeatSheetUrl,
      nativeFacing: -1,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 9,
      frameRate: 16,
    },
    reactionSheet: {
      textureKey: 'fighter-todd-reactions-sheet-v1',
      url: reactionSheetUrl,
      nativeFacing: 1,
      frameWidth: 320,
      frameHeight: 362,
      frameCount: 6,
      block: {
        animationKey: 'fighter-todd-block-v1',
        startFrame: 0,
        endFrame: 1,
        frameRate: 8,
        repeat: -1,
        yoyo: true,
      },
      hit: {
        animationKey: 'fighter-todd-hit-v1',
        startFrame: 2,
        endFrame: 3,
        frameRate: 12,
      },
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
