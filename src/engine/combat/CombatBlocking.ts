import type { MoveDefinition } from '../../content/characters';

export type GuardStance = 'none' | 'standing' | 'crouching';

export const BLOCK_DAMAGE_MULTIPLIER = 0.18;

export function resolveGuardStance(
  blocking: boolean,
  crouching: boolean,
  grounded: boolean,
): GuardStance {
  if (!blocking || !grounded) return 'none';
  return crouching ? 'crouching' : 'standing';
}

export function canGuardMove(move: MoveDefinition, stance: GuardStance): boolean {
  if (stance === 'none') return false;
  if (move.hitLevel === 'low') return stance === 'crouching';
  if (move.hitLevel === 'overhead') return stance === 'standing';
  return true;
}

export function calculateHitDamage(move: MoveDefinition, blocked: boolean, damageMultiplier = 1): number {
  return Math.round(move.damage * damageMultiplier * (blocked ? BLOCK_DAMAGE_MULTIPLIER : 1));
}
