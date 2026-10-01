import { describe, expect, it } from 'vitest';
import { fitGameViewport } from './layout';

describe('game viewport fitting', () => {
  it('centers a 16:9 game by fitting height on an ultrawide phone', () => {
    expect(fitGameViewport(1280, 590, 960, 540)).toEqual({
      width: 1048,
      height: 590,
    });
  });

  it('fits width when the viewport is narrower than the game ratio', () => {
    expect(fitGameViewport(800, 600, 960, 540)).toEqual({
      width: 800,
      height: 450,
    });
  });
});
