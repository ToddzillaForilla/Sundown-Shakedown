import type { CharacterDefinition, MoveDefinition } from '../../content/characters';

export const SUPER_METER_COST = 100;

export type AttackAction = 'light' | 'heavy' | 'super';
export type MoveSlot = keyof CharacterDefinition['moves'];

export interface AttackContext {
  grounded: boolean;
  launchedThisFrame: boolean;
  crouching: boolean;
  down: boolean;
  movement: -1 | 0 | 1;
  facing: 1 | -1;
  meter: number;
}

export interface AttackPresentation {
  durationMs: number;
  lunge: number;
  offsetY: number;
  angle: number;
  scale: number;
}

const attackPresentations: Record<MoveSlot, AttackPresentation> = {
  light: { durationMs: 65, lunge: 12, offsetY: -4, angle: 3, scale: 1.03 },
  heavy: { durationMs: 95, lunge: 24, offsetY: -4, angle: 7, scale: 1.05 },
  crouchLight: { durationMs: 80, lunge: 18, offsetY: 8, angle: -8, scale: 0.96 },
  airLight: { durationMs: 78, lunge: 20, offsetY: -14, angle: 12, scale: 1.02 },
  airHeavy: { durationMs: 115, lunge: 34, offsetY: 12, angle: 18, scale: 1.07 },
  special: { durationMs: 135, lunge: 38, offsetY: -8, angle: -5, scale: 1.08 },
  super: { durationMs: 190, lunge: 52, offsetY: -14, angle: -9, scale: 1.12 },
};

export function canUseSuper(meter: number): boolean {
  return meter >= SUPER_METER_COST;
}

export function resolvePlayerMoveSlot(
  action: AttackAction,
  context: AttackContext,
): MoveSlot | undefined {
  const airborne = !context.grounded || context.launchedThisFrame;
  if (action === 'super') return canUseSuper(context.meter) ? 'super' : undefined;
  if (action === 'heavy') {
    if (airborne) return 'airHeavy';
    return context.down && context.movement === context.facing ? 'special' : 'heavy';
  }
  if (airborne) return 'airLight';
  return context.crouching ? 'crouchLight' : 'light';
}

export function isHitInRange(
  attackerX: number,
  defenderX: number,
  attackerFacing: 1 | -1,
  range: number,
): boolean {
  const offset = defenderX - attackerX;
  return Math.abs(offset) <= range && Math.sign(offset) === attackerFacing;
}

export function getMoveSlot(
  moves: CharacterDefinition['moves'],
  move: MoveDefinition,
): MoveSlot {
  const entry = Object.entries(moves).find(([, candidate]) => candidate.id === move.id);
  if (!entry) throw new Error(`Unknown move: ${move.id}`);
  return entry[0] as MoveSlot;
}

export function getAttackPresentation(
  moves: CharacterDefinition['moves'],
  move: MoveDefinition,
): AttackPresentation {
  return attackPresentations[getMoveSlot(moves, move)];
}

export function getHitStunMs(move: MoveDefinition, blocked: boolean): number {
  if (blocked) return 110;
  if (move.kind === 'light') return 170;
  if (move.kind === 'heavy') return 260;
  if (move.kind === 'special') return 320;
  return 460;
}
