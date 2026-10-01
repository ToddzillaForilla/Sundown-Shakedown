import { describe, expect, it } from 'vitest';
import { characters, type MoveDefinition } from '../../content/characters';
import {
  BLOCK_DAMAGE_MULTIPLIER,
  calculateHitDamage,
  canGuardMove,
  resolveGuardStance,
  type GuardStance,
} from './CombatBlocking';

function moveAt(level: MoveDefinition['hitLevel']): MoveDefinition {
  return { ...characters.todd.moves.light, hitLevel: level };
}

describe('guard stance', () => {
  it('requires grounded held-back input and distinguishes standing from crouching', () => {
    expect(resolveGuardStance(false, false, true)).toBe('none');
    expect(resolveGuardStance(true, false, false)).toBe('none');
    expect(resolveGuardStance(true, false, true)).toBe('standing');
    expect(resolveGuardStance(true, true, true)).toBe('crouching');
  });
});

describe('attack guard rules', () => {
  it.each([
    ['high', 'standing', true],
    ['high', 'crouching', true],
    ['mid', 'standing', true],
    ['mid', 'crouching', true],
    ['low', 'standing', false],
    ['low', 'crouching', true],
    ['overhead', 'standing', true],
    ['overhead', 'crouching', false],
    ['mid', 'none', false],
  ] as Array<[MoveDefinition['hitLevel'], GuardStance, boolean]>)('%s against %s guard is %s', (level, stance, expected) => {
    expect(canGuardMove(moveAt(level), stance)).toBe(expected);
  });

  it('reduces a successful guard to the documented chip-damage rate', () => {
    const move = characters.todd.moves.heavy;
    expect(calculateHitDamage(move, false)).toBe(move.damage);
    expect(calculateHitDamage(move, true)).toBe(Math.round(move.damage * BLOCK_DAMAGE_MULTIPLIER));
  });

  it('applies difficulty damage scaling before guard reduction', () => {
    const move = characters.todd.moves.heavy;
    expect(calculateHitDamage(move, false, 0.76)).toBe(Math.round(move.damage * 0.76));
    expect(calculateHitDamage(move, true, 0.76)).toBe(
      Math.round(move.damage * 0.76 * BLOCK_DAMAGE_MULTIPLIER),
    );
  });

  it('assigns intentional hit levels to every player attack', () => {
    for (const character of Object.values(characters)) {
      const moves = Object.values(character.moves);
      const levels = moves.map((move) => move.hitLevel);
      expect(levels).toContain('low');
      expect(levels).toContain('overhead');
      expect(levels.every((level) => ['high', 'mid', 'low', 'overhead'].includes(level))).toBe(true);

      for (const move of moves) {
        expect(canGuardMove(move, 'standing')).toBe(move.hitLevel !== 'low');
        expect(canGuardMove(move, 'crouching')).toBe(move.hitLevel !== 'overhead');
      }
    }
  });
});
