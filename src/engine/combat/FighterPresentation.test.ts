import { describe, expect, it } from 'vitest';
import { characters } from '../../content/characters';
import { getAnimationNativeFacing, getReactionNativeFacing } from './FighterPresentation';
import { resolveVisualFacing } from './CombatMovement';

describe('fallback attack facing', () => {
  it.each([-1, 1] as const)('keeps Kristen’s frozen idle and walk poses facing the opponent on side %i', (facing) => {
    const kristen = characters.kristen;
    const defaultFacing = kristen.art.nativeFacing ?? 1;
    for (const sheet of [kristen.art.idleSheet!, kristen.art.walkSheet!, kristen.art.kickAttackSheet!]) {
      const nativeFacing = getAnimationNativeFacing(kristen, sheet.animationKey) ?? defaultFacing;
      const containerFacing = resolveVisualFacing(facing, defaultFacing);
      const localFacing = nativeFacing === defaultFacing ? 1 : -1;
      expect(nativeFacing).toBe(sheet.nativeFacing);
      expect(containerFacing * localFacing * nativeFacing).toBe(facing);
    }
  });

  it('preserves Todd’s authored facing and falls back to the base art for unknown clips', () => {
    const todd = characters.todd;
    expect(getAnimationNativeFacing(todd, todd.art.idleSheet!.animationKey))
      .toBe(todd.art.idleSheet!.nativeFacing ?? todd.art.nativeFacing);
    expect(getAnimationNativeFacing(todd, 'unknown')).toBe(todd.art.nativeFacing);
    expect(getAnimationNativeFacing(characters.kristen)).toBe(characters.kristen.art.nativeFacing);
  });

  it('uses legacy reaction facing when a special freezes a reaction pose', () => {
    const kristen = characters.kristen;
    expect(getAnimationNativeFacing(kristen, kristen.art.reactionSheet!.landing!.animationKey))
      .toBe(kristen.art.reactionSheet!.nativeFacing);
  });
});

describe('fighter reaction facing', () => {
  it('uses Todd’s dedicated block sheet facing when a blocked hit plays it', () => {
    const todd = characters.todd;

    expect(todd.art.blockSheet?.animationKey).toBe('fighter-todd-block-v1');
    expect(todd.art.blockSheet?.nativeFacing).toBe(-1);
    expect(todd.art.reactionSheet).toBeUndefined();
    expect(getReactionNativeFacing(todd, true)).toBe(-1);
  });

  it('uses the authored hit sheet facing for unblocked reactions', () => {
    expect(getReactionNativeFacing(characters.todd, false)).toBe(characters.todd.art.hitSheet?.nativeFacing);
  });
});
