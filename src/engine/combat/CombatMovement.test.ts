import { describe, expect, it } from 'vitest';
import { characters } from '../../content/characters';
import {
  calculateJumpApex,
  canFightersCross,
  CROSSING_CLEARANCE,
  faceTowardOpponent,
  FIGHTER_GROUND_Y,
  MIN_FIGHTER_DISTANCE,
  resolveVisualFacing,
  separateFighterPositions,
  STAGE_MAX_X,
  STAGE_MIN_X,
  stepVerticalMotion,
} from './CombatMovement';

describe('jump physics', () => {
  it('gives both fighters enough height to clear one another without leaving the arena', () => {
    for (const character of Object.values(characters)) {
      const apex = calculateJumpApex(character.stats.jumpVelocity);
      expect(apex).toBeGreaterThanOrEqual(130);
      expect(apex).toBeLessThanOrEqual(160);
      expect(FIGHTER_GROUND_Y - apex).toBeGreaterThan(200);
    }
  });

  it('rises, falls, and lands exactly on the ground', () => {
    let y = FIGHTER_GROUND_Y;
    let velocityY = -characters.todd.stats.jumpVelocity;
    let highestY = y;

    for (let frame = 0; frame < 180; frame += 1) {
      const next = stepVerticalMotion(y, velocityY, 1 / 60, FIGHTER_GROUND_Y);
      y = next.y;
      velocityY = next.velocityY;
      highestY = Math.min(highestY, y);
      if (frame > 0 && next.grounded) break;
    }

    expect(highestY).toBeLessThanOrEqual(FIGHTER_GROUND_Y - 130);
    expect(y).toBe(FIGHTER_GROUND_Y);
    expect(velocityY).toBe(0);
  });
});

describe('fighter crossing and separation', () => {
  it('allows crossing only after an airborne fighter clears the threshold', () => {
    expect(canFightersCross(
      { y: FIGHTER_GROUND_Y - CROSSING_CLEARANCE + 1, grounded: false },
      { y: FIGHTER_GROUND_Y, grounded: true },
      FIGHTER_GROUND_Y,
    )).toBe(false);
    expect(canFightersCross(
      { y: FIGHTER_GROUND_Y - CROSSING_CLEARANCE, grounded: false },
      { y: FIGHTER_GROUND_Y, grounded: true },
      FIGHTER_GROUND_Y,
    )).toBe(true);
  });

  it('keeps grounded fighters separated at both stage boundaries', () => {
    const leftEdge = separateFighterPositions(STAGE_MIN_X, STAGE_MIN_X);
    expect(leftEdge.opponentX - leftEdge.playerX).toBe(MIN_FIGHTER_DISTANCE);
    expect(leftEdge.playerX).toBe(STAGE_MIN_X);

    const rightEdge = separateFighterPositions(STAGE_MAX_X, STAGE_MAX_X);
    expect(Math.abs(rightEdge.playerX - rightEdge.opponentX)).toBe(MIN_FIGHTER_DISTANCE);
    expect(rightEdge.opponentX).toBe(STAGE_MAX_X);
  });

  it('reverses facing after fighters cross without jittering at equal positions', () => {
    expect(faceTowardOpponent(300, 600, 1)).toBe(1);
    expect(faceTowardOpponent(700, 400, 1)).toBe(-1);
    expect(faceTowardOpponent(500, 500, -1)).toBe(-1);
  });

  it('accounts for character art authored in the opposite direction', () => {
    expect(resolveVisualFacing(1, -1)).toBe(-1);
    expect(resolveVisualFacing(-1, -1)).toBe(1);
    expect(resolveVisualFacing(-1)).toBe(-1);
  });

  it('lets a forward jump clear an opponent and land on the other side', () => {
    let playerX = 300;
    let playerY = FIGHTER_GROUND_Y;
    let velocityY = -characters.todd.stats.jumpVelocity;
    const opponentX = 400;

    for (let frame = 0; frame < 120; frame += 1) {
      playerX += characters.todd.stats.walkSpeed / 60;
      const motion = stepVerticalMotion(playerY, velocityY, 1 / 60, FIGHTER_GROUND_Y);
      playerY = motion.y;
      velocityY = motion.velocityY;

      if (!canFightersCross(
        { y: playerY, grounded: motion.grounded },
        { y: FIGHTER_GROUND_Y, grounded: true },
        FIGHTER_GROUND_Y,
      )) {
        playerX = separateFighterPositions(playerX, opponentX).playerX;
      }
      if (frame > 0 && motion.grounded) break;
    }

    expect(playerX).toBeGreaterThan(opponentX);
    expect(faceTowardOpponent(playerX, opponentX, 1)).toBe(-1);
  });
});
