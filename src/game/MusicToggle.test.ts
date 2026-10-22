import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
import { createMusicToggle } from './MusicToggle';

vi.mock('./config', () => ({ GAME_WIDTH: 960 }));

function setup(registry = new Map<string, boolean>()) {
  const events: Record<string, (...args: any[]) => void> = {};
  const keys: Record<string, (event: { repeat: boolean }) => void> = {};
  const graphics: Record<string, any> = {};
  for (const name of ['setDepth', 'setAlpha', 'clear', 'lineStyle', 'strokeRect',
    'beginPath', 'moveTo', 'lineTo', 'closePath', 'strokePath', 'lineBetween', 'arc']) {
    graphics[name] = vi.fn(() => graphics);
  }
  const zone = {
    setDepth: () => zone, setInteractive: () => zone,
    on: (event: string, callback: (...args: any[]) => void) => { events[event] = callback; return zone; },
  };
  // Simulate a Web Audio getter that has not caught up with setMute yet.
  const music = { mute: false, setMute: vi.fn() };
  const scene = {
    registry, sound: { get: () => music },
    add: { graphics: () => graphics, zone: () => zone },
    input: { keyboard: { on: (event: string, callback: (e: { repeat: boolean }) => void) => { keys[event] = callback; } } },
  };
  createMusicToggle(scene as unknown as Phaser.Scene);
  return { events, keys, music, registry, graphics };
}

describe('music speaker control', () => {
  it('draws the slash immediately and retains mute across the selection-to-fight transition', () => {
    const selection = setup();
    selection.events.pointerup({}, 0, 0, { stopPropagation: vi.fn() });
    expect(selection.music.setMute).toHaveBeenLastCalledWith(true);
    expect(selection.graphics.lineBetween).toHaveBeenCalled();
    const fight = setup(selection.registry);
    expect(fight.music.setMute).toHaveBeenLastCalledWith(true);
    expect(fight.graphics.lineBetween).toHaveBeenCalled();
    fight.keys['keydown-M']({ repeat: true });
    expect(fight.registry.get('music-muted')).toBe(true);
    fight.keys['keydown-M']({ repeat: false });
    expect(fight.music.setMute).toHaveBeenLastCalledWith(false);
  });

  it('consumes pointer presses so music clicks cannot trigger a fight attack', () => {
    const { events } = setup();
    const stopPropagation = vi.fn();
    events.pointerdown({}, 0, 0, { stopPropagation });
    events.pointerup({}, 0, 0, { stopPropagation });
    expect(stopPropagation).toHaveBeenCalledTimes(2);
  });
});
