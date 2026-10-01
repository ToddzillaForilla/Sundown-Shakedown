export const COMBAT_GRAVITY = 1050;
export const FIGHTER_GROUND_Y = 402;
export const STAGE_MIN_X = 72;
export const STAGE_MAX_X = 888;
export const MIN_FIGHTER_DISTANCE = 78;
export const CROSSING_CLEARANCE = 44;

export interface VerticalMotion {
  y: number;
  velocityY: number;
  grounded: boolean;
}

export interface FighterTraversalState {
  y: number;
  grounded: boolean;
}

export interface FighterPositions {
  playerX: number;
  opponentX: number;
}

export function calculateJumpApex(jumpVelocity: number, gravity = COMBAT_GRAVITY): number {
  return (jumpVelocity * jumpVelocity) / (2 * gravity);
}

export function stepVerticalMotion(
  y: number,
  velocityY: number,
  deltaSeconds: number,
  groundY: number,
): VerticalMotion {
  if (y >= groundY && velocityY >= 0) {
    return { y: groundY, velocityY: 0, grounded: true };
  }

  const nextVelocity = velocityY + COMBAT_GRAVITY * deltaSeconds;
  const nextY = y + nextVelocity * deltaSeconds;
  if (nextY >= groundY) return { y: groundY, velocityY: 0, grounded: true };
  return { y: nextY, velocityY: nextVelocity, grounded: false };
}

export function canFightersCross(
  player: FighterTraversalState,
  opponent: FighterTraversalState,
  groundY: number,
): boolean {
  return (!player.grounded && player.y <= groundY - CROSSING_CLEARANCE)
    || (!opponent.grounded && opponent.y <= groundY - CROSSING_CLEARANCE);
}

export function separateFighterPositions(playerX: number, opponentX: number): FighterPositions {
  const playerIsLeft = playerX <= opponentX;
  let leftX = playerIsLeft ? playerX : opponentX;
  let rightX = playerIsLeft ? opponentX : playerX;
  const distance = rightX - leftX;
  if (distance >= MIN_FIGHTER_DISTANCE) return { playerX, opponentX };

  const initialPush = (MIN_FIGHTER_DISTANCE - distance) / 2;
  leftX = Math.max(STAGE_MIN_X, leftX - initialPush);
  rightX = Math.min(STAGE_MAX_X, rightX + initialPush);

  let missingDistance = MIN_FIGHTER_DISTANCE - (rightX - leftX);
  if (missingDistance > 0) {
    const rightRoom = STAGE_MAX_X - rightX;
    const rightAdjustment = Math.min(missingDistance, rightRoom);
    rightX += rightAdjustment;
    missingDistance -= rightAdjustment;
  }
  if (missingDistance > 0) leftX = Math.max(STAGE_MIN_X, leftX - missingDistance);

  return playerIsLeft
    ? { playerX: leftX, opponentX: rightX }
    : { playerX: rightX, opponentX: leftX };
}

export function faceTowardOpponent(
  selfX: number,
  opponentX: number,
  currentFacing: 1 | -1,
): 1 | -1 {
  if (selfX === opponentX) return currentFacing;
  return opponentX > selfX ? 1 : -1;
}

export function resolveVisualFacing(
  facing: 1 | -1,
  nativeFacing: 1 | -1 = 1,
): 1 | -1 {
  return facing * nativeFacing as 1 | -1;
}
