import { describe, expect, it } from 'vitest';
import { characters } from '../../content/characters';
import {
  canUseSuper,
  getAuthoredAttackAnimation,
  getAttackPresentation,
  getHitStunMs,
  isHitInRange,
  resolvePlayerMoveSlot,
  type AttackAction,
  type AttackContext,
} from './CombatAttacks';

const grounded: AttackContext = {
  grounded: true,
  launchedThisFrame: false,
  crouching: false,
  down: false,
  movement: 0,
  facing: 1,
  meter: 0,
};

describe('player move selection', () => {
  it.each([
    ['light', grounded, 'light'],
    ['light', { ...grounded, crouching: true, down: true }, 'crouchLight'],
    ['light', { ...grounded, grounded: false }, 'airLight'],
    ['light', { ...grounded, launchedThisFrame: true }, 'airLight'],
    ['heavy', grounded, 'heavy'],
    ['heavy', { ...grounded, down: true, movement: 1 }, 'special'],
    ['heavy', { ...grounded, grounded: false }, 'airHeavy'],
    ['heavy', { ...grounded, launchedThisFrame: true }, 'airHeavy'],
    ['kick', grounded, 'crouchLight'],
    ['kick', { ...grounded, grounded: false }, 'airLight'],
    ['punch', grounded, 'heavy'],
    ['punch', { ...grounded, down: true, movement: 1 }, 'heavy'],
    ['punch', { ...grounded, grounded: false }, 'airHeavy'],
    ['super', { ...grounded, meter: 100 }, 'super'],
  ] as Array<[AttackAction, AttackContext, string]>)('maps %s input to %s', (action, context, expected) => {
    expect(resolvePlayerMoveSlot(action, context)).toBe(expected);
  });

  it('requires full meter for a super', () => {
    expect(canUseSuper(99)).toBe(false);
    expect(resolvePlayerMoveSlot('super', { ...grounded, meter: 99 })).toBeUndefined();
    expect(canUseSuper(100)).toBe(true);
  });
});

describe('attack rules and content', () => {
  it('hits only within range and in front of the attacker', () => {
    expect(isHitInRange(100, 172, 1, 72)).toBe(true);
    expect(isHitInRange(100, 173, 1, 72)).toBe(false);
    expect(isHitInRange(100, 50, 1, 72)).toBe(false);
    expect(isHitInRange(100, 50, -1, 72)).toBe(true);
  });

  it('gives every move valid damage, range, cooldown, and hit stun', () => {
    for (const character of Object.values(characters)) {
      for (const move of Object.values(character.moves)) {
        expect(move.damage).toBeGreaterThan(0);
        expect(move.range).toBeGreaterThan(0);
        expect(move.cooldownMs).toBeGreaterThan(getHitStunMs(move, false));
        expect(getHitStunMs(move, false)).toBeGreaterThan(getHitStunMs(move, true));
      }
    }
  });

  it('gives all seven move slots distinct attack motion', () => {
    for (const character of Object.values(characters)) {
      const signatures = Object.values(character.moves).map((move) => {
        const presentation = getAttackPresentation(character.moves, move);
        return JSON.stringify(presentation);
      });
      expect(new Set(signatures).size).toBe(7);
    }
  });

  it('maps grounded kick and punch moves to authored attack animations', () => {
    for (const character of Object.values(characters)) {
      expect(getAuthoredAttackAnimation(character.moves, character.moves.light)).toBe('kick');
      expect(getAuthoredAttackAnimation(character.moves, character.moves.crouchLight)).toBe('kick');
      expect(getAuthoredAttackAnimation(character.moves, character.moves.heavy)).toBe('punch');
      expect(getAuthoredAttackAnimation(character.moves, character.moves.heavy, true)).toBe('crouchPunch');
      expect(getAuthoredAttackAnimation(character.moves, character.moves.airLight)).toBeUndefined();
      expect(getAuthoredAttackAnimation(character.moves, character.moves.special)).toBeUndefined();
    }
  });
});
