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
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
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

