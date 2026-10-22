export type FighterAnimationState =
  | 'idle'
  | 'walk'
  | 'crouch'
  | 'block'
  | 'jump'
  | 'fall'
  | 'landing'
  | 'attack'
  | 'hit'
  | 'victory'
  | 'ko';

export interface FighterAnimationContext {
  now: number;
  grounded: boolean;
  velocityY: number;
  moving: boolean;
  blocking: boolean;
  crouching: boolean;
  landingDurationMs?: number;
}

const LANDING_DURATION_MS = 110;

export class FighterAnimationStateMachine {
  private state: FighterAnimationState = 'idle';
  private lockedUntil = 0;
  private landingUntil = 0;
  private wasGrounded = true;
  private landingPending = false;

  get current(): FighterAnimationState {
    return this.state;
  }

  reset(grounded = true): void {
    this.state = grounded ? 'idle' : 'fall';
    this.lockedUntil = 0;
    this.landingUntil = 0;
    this.wasGrounded = grounded;
    this.landingPending = false;
  }

  beginAttack(now: number, durationMs: number): void {
    if (this.state === 'ko' || this.state === 'victory') return;
    this.state = 'attack';
    this.lockedUntil = now + durationMs;
  }

  beginHit(now: number, durationMs: number): void {
    if (this.state === 'ko' || this.state === 'victory') return;
    this.state = 'hit';
    this.lockedUntil = now + durationMs;
  }

  knockOut(): void {
    this.state = 'ko';
    this.lockedUntil = Number.POSITIVE_INFINITY;
    this.landingPending = false;
  }

  celebrate(): void {
    if (this.state === 'ko') return;
    this.state = 'victory';
    this.lockedUntil = Number.POSITIVE_INFINITY;
    this.landingPending = false;
  }

  update(context: FighterAnimationContext): FighterAnimationState {
    if (this.state === 'ko' || this.state === 'victory') return this.state;

    if (!this.wasGrounded && context.grounded) this.landingPending = true;
    this.wasGrounded = context.grounded;

    if ((this.state === 'attack' || this.state === 'hit') && context.now < this.lockedUntil) {
      return this.state;
    }

    if (!context.grounded) {
      this.state = context.velocityY < 0 ? 'jump' : 'fall';
      return this.state;
    }

    if (this.landingPending) {
      this.landingPending = false;
      this.landingUntil = context.now + Math.max(LANDING_DURATION_MS, context.landingDurationMs ?? 0);
      this.state = 'landing';
      return this.state;
    }

    if (this.state === 'landing' && context.now < this.landingUntil) return this.state;
    if (context.crouching) this.state = 'crouch';
    else if (context.blocking) this.state = 'block';
    else if (context.moving) this.state = 'walk';
    else this.state = 'idle';
    return this.state;
  }
}
