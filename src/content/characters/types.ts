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
  kind: 'light' | 'heavy' | 'special' | 'super';
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
  };
  palette: CharacterPalette;
  stats: CharacterStats;
  moves: {
    light: MoveDefinition;
    heavy: MoveDefinition;
    special: MoveDefinition;
    super: MoveDefinition;
  };
}

