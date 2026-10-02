import type { CharacterDefinition } from '../types';
import { toddMoves } from './moves';
import fighterUrl from './assets/sprites/todd-concept-fighter.png';
import idleSheetUrl from './assets/sprites/todd-idle-sheet-v2-laptop.png';
import walkSheetUrl from './assets/sprites/todd-walk-sheet-v5-idle-scale.png';
import kickAttackSheetUrl from './assets/sprites/todd-kick-attack-sheet-v2.png';
import punchAttackSheetUrl from './assets/sprites/todd-punch-attack-sheet-v7-arm-continuity.png';
import crouchPunchAttackSheetUrl from './assets/sprites/todd-crouch-punch-attack-sheet-v1.png';
import reactionSheetUrl from './assets/sprites/todd-reactions-sheet-v1.png';
import portraitUrl from './assets/portraits/todd-portrait-v2.png';

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
      textureKey: 'fighter-todd-walk-sheet-v5-idle-scale',
      animationKey: 'fighter-todd-walk-v5-idle-scale',
      url: walkSheetUrl,
      frameWidth: 260,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 10,
    },
    kickAttackSheet: {
      textureKey: 'fighter-todd-kick-attack-sheet-v2',
      animationKey: 'fighter-todd-kick-attack-v2',
      url: kickAttackSheetUrl,
      nativeFacing: 1,
      frameWidth: 320,
      frameHeight: 362,
      frameCount: 6,
      frameRate: 22,
    },
    punchAttackSheet: {
      textureKey: 'fighter-todd-punch-attack-sheet-v7-arm-continuity',
      animationKey: 'fighter-todd-punch-attack-v7-arm-continuity',
      url: punchAttackSheetUrl,
      nativeFacing: -1,
      frameWidth: 320,
      frameHeight: 430,
      frameCount: 6,
      frameRate: 12,
    },
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
      landing: {
        animationKey: 'fighter-todd-landing-v1',
        startFrame: 4,
        endFrame: 5,
        frameRate: 18,
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

