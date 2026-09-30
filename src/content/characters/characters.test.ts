import { describe, expect, it } from 'vitest';
import { characterList } from './index';

describe('character content packages', () => {
  it('registers unique fighter identifiers', () => {
    const ids = characterList.map((character) => character.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('provides valid stats and four distinct core moves', () => {
    for (const character of characterList) {
      expect(character.stats.maxHealth).toBeGreaterThan(0);
      expect(character.stats.walkSpeed).toBeGreaterThan(0);
      const moves = Object.values(character.moves);
      expect(new Set(moves.map((move) => move.id)).size).toBe(4);
      for (const move of moves) {
        expect(move.damage).toBeGreaterThan(0);
        expect(move.range).toBeGreaterThan(0);
        expect(move.cooldownMs).toBeGreaterThan(0);
      }
    }
  });

  it('keeps the approved themes assigned to the correct fighter', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(todd?.themes).toEqual(['hacking', 'video games', 'skateboarding']);
    expect(kristen?.themes).toEqual(['plants', 'cooking', 'camping']);
  });
});

