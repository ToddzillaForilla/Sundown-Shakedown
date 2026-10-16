import { describe, expect, it } from 'vitest';
import { FighterAnimationStateMachine, type FighterAnimationContext } from './FighterAnimationState';

const grounded: FighterAnimationContext = {
  now: 0,
  grounded: true,
  velocityY: 0,
  moving: false,
  blocking: false,
  crouching: false,
};

describe('fighter animation transitions', () => {
  it('transitions idle to walk and back to idle', () => {
    const machine = new FighterAnimationStateMachine();
    expect(machine.update(grounded)).toBe('idle');
    expect(machine.update({ ...grounded, now: 16, moving: true })).toBe('walk');
    expect(machine.update({ ...grounded, now: 32 })).toBe('idle');
  });

  it('transitions jump to fall to landing to idle', () => {
    const machine = new FighterAnimationStateMachine();
    expect(machine.update({ ...grounded, now: 10, grounded: false, velocityY: -320 })).toBe('jump');
    expect(machine.update({ ...grounded, now: 200, grounded: false, velocityY: 120 })).toBe('fall');
    expect(machine.update({ ...grounded, now: 400 })).toBe('landing');
    expect(machine.update({ ...grounded, now: 480 })).toBe('landing');
    expect(machine.update({ ...grounded, now: 511 })).toBe('idle');
  });

  it('holds an authored landing recovery for the full clip duration', () => {
    const machine = new FighterAnimationStateMachine();
    machine.reset(false);
    expect(machine.update({ ...grounded, now: 10, grounded: false, velocityY: 120 })).toBe('fall');
    expect(machine.update({ ...grounded, now: 100, landingDurationMs: 4 / 18 * 1000 })).toBe('landing');
    expect(machine.update({ ...grounded, now: 321 })).toBe('landing');
    expect(machine.update({ ...grounded, now: 323 })).toBe('idle');
  });

  it('holds attack through recovery before returning to movement', () => {
    const machine = new FighterAnimationStateMachine();
    machine.beginAttack(100, 180);
    expect(machine.update({ ...grounded, now: 200, moving: true })).toBe('attack');
    expect(machine.update({ ...grounded, now: 281, moving: true })).toBe('walk');
  });

  it('returns to jump or fall when an air attack ends before landing', () => {
    const machine = new FighterAnimationStateMachine();
    machine.reset(false);
    machine.beginAttack(100, 180);

    expect(machine.update({ ...grounded, now: 200, grounded: false, velocityY: -90 })).toBe('attack');
    expect(machine.update({ ...grounded, now: 281, grounded: false, velocityY: -90 })).toBe('jump');
    expect(machine.update({ ...grounded, now: 300, grounded: false, velocityY: 70 })).toBe('fall');
  });

  it('allows hit stun to interrupt attack recovery', () => {
    const machine = new FighterAnimationStateMachine();
    machine.beginAttack(100, 200);
    machine.beginHit(150, 180);
    expect(machine.update({ ...grounded, now: 250 })).toBe('hit');
    expect(machine.update({ ...grounded, now: 331 })).toBe('idle');
  });

  it('preserves a landing that occurs during an attack lock', () => {
    const machine = new FighterAnimationStateMachine();
    machine.reset(false);
    machine.beginAttack(100, 200);
    expect(machine.update({ ...grounded, now: 250 })).toBe('attack');
    expect(machine.update({ ...grounded, now: 301 })).toBe('landing');
  });

  it('makes KO terminal until the fighter is reset', () => {
    const machine = new FighterAnimationStateMachine();
    machine.beginHit(100, 180);
    machine.knockOut();
    expect(machine.update({ ...grounded, now: 1000, moving: true })).toBe('ko');
    machine.beginAttack(1000, 200);
    expect(machine.current).toBe('ko');
    machine.reset();
    expect(machine.current).toBe('idle');
  });
});
