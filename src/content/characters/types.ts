export type CharacterId = 'todd' | 'kristen';

export interface CharacterPalette {
  primary: number;
  secondary: number;
  accent: number;
  skin: number;
}

export interface CharacterStats {
  maxHealth: number;
  walkSpeed: number;
  retreatSpeed: number;
  jumpVelocity: number;
}

export interface MoveDefinition {
  id: string;
  name: string;
  damage: number;
  range: number;
  cooldownMs: number;
  meterGain: number;
  knockback: number;
  kind: 'light' | 'heavy' | 'special' | 'super';
  hitLevel: 'high' | 'mid' | 'low' | 'overhead';
}

export interface CharacterAnimationSheet {
  textureKey: string;
  animationKey: string;
  url: string;
  frameOrder?: readonly number[];
  nativeFacing?: 1 | -1;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
}

export interface CharacterAnimationClip {
  animationKey: string;
  startFrame: number;
  endFrame: number;
  frameRate: number;
  repeat?: number;
  yoyo?: boolean;
}

export interface CharacterReactionSheet {
  textureKey: string;
  url: string;
  nativeFacing?: 1 | -1;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  block: CharacterAnimationClip;
  hit: CharacterAnimationClip;
  landing?: CharacterAnimationClip;
}

export interface CharacterDefinition {
  id: CharacterId;
  displayName: string;
  tagline: string;
  themes: readonly string[];
  art: {
    fighterTextureKey: string;
    fighterUrl: string;
    portraitTextureKey: string;
    portraitUrl: string;
    nativeFacing?: 1 | -1;
    renderScale?: number;
    idleSheet?: CharacterAnimationSheet;
    walkSheet?: CharacterAnimationSheet;
    walkLeftSheet?: CharacterAnimationSheet;
    jumpSheet?: CharacterAnimationSheet;
    landingSheet?: CharacterAnimationSheet;
    crouchSheet?: CharacterAnimationSheet;
    crouchHoldFrame?: number;
    blockSheet?: CharacterAnimationSheet;
    blockHoldFrame?: number;
    kickAttackSheet?: CharacterAnimationSheet;
    punchAttackSheet?: CharacterAnimationSheet;
    alternatePunchAttackSheet?: CharacterAnimationSheet;
    alternatePunchChance?: number;
    airKickAttackSheet?: CharacterAnimationSheet;
    airPunchAttackSheet?: CharacterAnimationSheet;
    hitSheet?: CharacterAnimationSheet;
    defeatSheet?: CharacterAnimationSheet;
    /** Without loopStartFrame, play once and hold the last frame. */
    victorySheet?: CharacterAnimationSheet & { loopStartFrame?: number };
    reactionSheet?: CharacterReactionSheet;
  };
  palette: CharacterPalette;
  stats: CharacterStats;
  moves: {
    light: MoveDefinition;
    heavy: MoveDefinition;
    crouchLight: MoveDefinition;
    airLight: MoveDefinition;
    airHeavy: MoveDefinition;
    special: MoveDefinition;
    super: MoveDefinition;
  };
}

