export type CombatFeedbackKind = 'attack' | 'hit' | 'guard';
export type CombatTintMode = 'multiply' | 'overlay';

export interface CombatFlashProfile {
  color: number;
  durationMs: number;
  mode: CombatTintMode;
}

const HIT_FLASH: CombatFlashProfile = {
  color: 0xff6978,
  durationMs: 85,
  mode: 'overlay',
};

const GUARD_FLASH: CombatFlashProfile = {
  color: 0xe3f6ff,
  durationMs: 55,
  mode: 'multiply',
};

function softenTowardWhite(color: number): number {
  const mix = (channel: number) => Math.round(channel + (255 - channel) * 0.7);
  const red = mix((color >> 16) & 0xff);
  const green = mix((color >> 8) & 0xff);
  const blue = mix(color & 0xff);
  return (red << 16) | (green << 8) | blue;
}

export function getCombatFlashProfile(kind: CombatFeedbackKind, attackAccent: number): CombatFlashProfile {
  if (kind === 'attack') {
    return {
      color: softenTowardWhite(attackAccent),
      durationMs: 55,
      mode: 'multiply',
    };
  }
  return kind === 'guard' ? GUARD_FLASH : HIT_FLASH;
}
