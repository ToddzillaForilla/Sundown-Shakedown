export type BufferedAction = 'jump' | 'kick' | 'punch' | 'super';

export interface DirectionalInput {
  left: boolean;
  right: boolean;
  down: boolean;
}

export interface DirectionalIntent {
  movement: -1 | 0 | 1;
  crouching: boolean;
  guardReady: boolean;
  blocking: boolean;
}

interface BufferedPress {
  action: BufferedAction;
  expiresAt: number;
}

const DEFAULT_BUFFER_WINDOW_MS = 180;
const MAX_BUFFERED_PRESSES = 8;

export function resolveDirectionalIntent(
  input: DirectionalInput,
  opponentIsRight: boolean,
  grounded: boolean,
  opponentAttacking = false,
): DirectionalIntent {
  const movement: -1 | 0 | 1 = input.left === input.right ? 0 : input.left ? -1 : 1;
  const away = opponentIsRight ? -1 : 1;
  const guardReady = movement === away && grounded;

  return {
    movement,
    crouching: input.down && grounded,
    guardReady,
    blocking: guardReady && opponentAttacking,
  };
}

export class PlayerInputBuffer {
  private presses: BufferedPress[] = [];

  constructor(private readonly bufferWindowMs = DEFAULT_BUFFER_WINDOW_MS) {}

  press(action: BufferedAction, now: number): void {
    this.discardExpired(now);
    this.presses.push({ action, expiresAt: now + this.bufferWindowMs });
    if (this.presses.length > MAX_BUFFERED_PRESSES) this.presses.shift();
  }

  consume(action: BufferedAction, now: number): boolean {
    this.discardExpired(now);
    const index = this.presses.findIndex((press) => press.action === action);
    if (index < 0) return false;
    this.presses.splice(index, 1);
    return true;
  }

  consumeFirst(actions: readonly BufferedAction[], now: number): BufferedAction | undefined {
    for (const action of actions) {
      if (this.consume(action, now)) return action;
    }
    return undefined;
  }

  clear(): void {
    this.presses = [];
  }

  private discardExpired(now: number): void {
    this.presses = this.presses.filter((press) => press.expiresAt >= now);
  }
}
