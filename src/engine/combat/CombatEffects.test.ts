import { describe, expect, it } from 'vitest';
import { getCombatFlashProfile, type CombatFeedbackKind } from './CombatEffects';

describe('combat visual feedback', () => {
  it('uses short, artwork-preserving flashes for attack, hit, and guard states', () => {
    const kinds: CombatFeedbackKind[] = ['attack', 'hit', 'guard'];
    for (const kind of kinds) {
      const profile = getCombatFlashProfile(kind, 0x55dfff);
      expect(profile.durationMs).toBeGreaterThan(0);
      expect(profile.durationMs).toBeLessThanOrEqual(85);
      expect(['multiply', 'overlay']).toContain(profile.mode);
    }
  });

  it('keeps all three feedback states visually distinguishable', () => {
    const profiles = (['attack', 'hit', 'guard'] as CombatFeedbackKind[])
      .map((kind) => getCombatFlashProfile(kind, 0x55dfff));
    expect(new Set(profiles.map((profile) => profile.color)).size).toBe(3);
    expect(getCombatFlashProfile('hit', 0).mode).toBe('overlay');
    expect(getCombatFlashProfile('guard', 0).mode).toBe('multiply');
  });

  it('uses the fighter accent only for the attack flash', () => {
    expect(getCombatFlashProfile('attack', 0x75d55d).color).not.toBe(0x75d55d);
    expect(getCombatFlashProfile('attack', 0x75d55d).color).not.toBe(0xffffff);
    expect(getCombatFlashProfile('hit', 0x75d55d).color).not.toBe(0x75d55d);
  });
});
