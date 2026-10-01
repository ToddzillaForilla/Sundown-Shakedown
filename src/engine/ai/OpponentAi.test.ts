import { describe, expect, it } from 'vitest';
import { characters } from '../../content/characters';
import { STAGE_MAX_X, STAGE_MIN_X } from '../combat/CombatMovement';
import {
  OpponentAi,
  getAiDifficultyProfile,
  isNearStageCorner,
  shouldReleaseCornerPressure,
} from './OpponentAi';

function fighter(x: number, canAct = true) {
  return {
    x,
    meter: 0,
    isGrounded: true,
    definition: characters.kristen,
    canAct: () => canAct,
  };
}

describe('AI difficulty profiles', () => {
  it('changes reaction, aggression, defense, damage, and recovery at every difficulty', () => {
    const easy = getAiDifficultyProfile('easy');
    const normal = getAiDifficultyProfile('normal');
    const hard = getAiDifficultyProfile('hard');

    expect(easy.reactionMs).toBeGreaterThan(normal.reactionMs);
    expect(normal.reactionMs).toBeGreaterThan(hard.reactionMs);
    expect(easy.aggression).toBeLessThan(normal.aggression);
    expect(normal.aggression).toBeLessThan(hard.aggression);
    expect(easy.defense).toBeLessThan(normal.defense);
    expect(normal.defense).toBeLessThan(hard.defense);
    expect(easy.damageMultiplier).toBeLessThan(normal.damageMultiplier);
    expect(normal.damageMultiplier).toBeLessThan(hard.damageMultiplier);
    expect(easy.attackRecoveryMs).toBeGreaterThan(normal.attackRecoveryMs);
    expect(normal.attackRecoveryMs).toBeGreaterThan(hard.attackRecoveryMs);
  });
});

describe('AI spacing and corner pressure', () => {
  it('recognizes both stage corners but not center stage', () => {
    expect(isNearStageCorner(STAGE_MIN_X)).toBe(true);
    expect(isNearStageCorner(STAGE_MAX_X)).toBe(true);
    expect(isNearStageCorner((STAGE_MIN_X + STAGE_MAX_X) / 2)).toBe(false);
  });

  it('releases corner pressure at the difficulty-specific attack limit', () => {
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const profile = getAiDifficultyProfile(difficulty);
      expect(shouldReleaseCornerPressure(STAGE_MIN_X, 90, profile.maxCornerPressureAttacks - 1, profile)).toBe(false);
      expect(shouldReleaseCornerPressure(STAGE_MIN_X, 90, profile.maxCornerPressureAttacks, profile)).toBe(true);
    }
  });

  it('retreats instead of attacking while unable to act at close range', () => {
    const ai = new OpponentAi('easy', () => 0);
    const intent = ai.update(1000, fighter(150, false), fighter(220));
    expect(intent.attack).toBeUndefined();
    expect(intent.move).toBe(-1);
  });

  it('does not repeat a one-shot attack intent on following frames', () => {
    const rolls = [0.5, 0.99, 0, 0.99];
    const ai = new OpponentAi('hard', () => rolls.shift() ?? 0.99);
    const self = fighter(300);
    const opponent = fighter(390);
    const first = ai.update(1000, self, opponent);
    const second = ai.update(1001, self, opponent);
    expect(first.attack).toBeDefined();
    expect(second.attack).toBeUndefined();
  });
});
