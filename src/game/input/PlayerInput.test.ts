import { describe, expect, it } from 'vitest';
import { PlayerInputBuffer, resolveDirectionalIntent } from './PlayerInput';

describe('player directional input', () => {
  it('keeps held left and right movement deterministic', () => {
    expect(resolveDirectionalIntent({ left: true, right: false, down: false }, true, true).movement).toBe(-1);
    expect(resolveDirectionalIntent({ left: false, right: true, down: false }, true, true).movement).toBe(1);
    expect(resolveDirectionalIntent({ left: true, right: true, down: false }, true, true).movement).toBe(0);
  });

  it('holds crouch only while grounded', () => {
    expect(resolveDirectionalIntent({ left: false, right: false, down: true }, true, true).crouching).toBe(true);
    expect(resolveDirectionalIntent({ left: false, right: false, down: true }, true, false).crouching).toBe(false);
  });

  it('treats holding away as guard-ready without showing an idle block', () => {
    const holdingLeft = { left: true, right: false, down: false };
    const idleIntent = resolveDirectionalIntent(holdingLeft, true, true, false);

    expect(idleIntent.guardReady).toBe(true);
    expect(idleIntent.blocking).toBe(false);
  });

  it('blocks only while holding away during an incoming attack', () => {
    const holdingLeft = { left: true, right: false, down: false };

    expect(resolveDirectionalIntent(holdingLeft, true, true, true).blocking).toBe(true);
    expect(resolveDirectionalIntent(holdingLeft, true, true, false).blocking).toBe(false);
    expect(resolveDirectionalIntent(holdingLeft, false, true, true).blocking).toBe(false);
    expect(resolveDirectionalIntent(holdingLeft, true, false, true).blocking).toBe(false);
  });
});

describe('player input buffer', () => {
  it('retains a quick press through a short action lockout', () => {
    const buffer = new PlayerInputBuffer(180);
    buffer.press('light', 1_000);

    expect(buffer.consume('light', 1_179)).toBe(true);
  });

  it('expires stale presses instead of firing them late', () => {
    const buffer = new PlayerInputBuffer(180);
    buffer.press('heavy', 1_000);

    expect(buffer.consume('heavy', 1_181)).toBe(false);
  });

  it('keeps rapid distinct and repeated inputs available independently', () => {
    const buffer = new PlayerInputBuffer(180);
    buffer.press('jump', 1_000);
    buffer.press('light', 1_010);
    buffer.press('light', 1_020);

    expect(buffer.consume('jump', 1_030)).toBe(true);
    expect(buffer.consume('light', 1_030)).toBe(true);
    expect(buffer.consume('light', 1_030)).toBe(true);
    expect(buffer.consume('light', 1_030)).toBe(false);
  });

  it('consumes only the highest-priority available attack', () => {
    const buffer = new PlayerInputBuffer(180);
    buffer.press('light', 1_000);
    buffer.press('heavy', 1_010);

    expect(buffer.consumeFirst(['super', 'heavy', 'light'], 1_020)).toBe('heavy');
    expect(buffer.consumeFirst(['super', 'heavy', 'light'], 1_020)).toBe('light');
  });

  it('clears queued presses between rounds', () => {
    const buffer = new PlayerInputBuffer();
    buffer.press('super', 500);
    buffer.clear();

    expect(buffer.consume('super', 500)).toBe(false);
  });
});
