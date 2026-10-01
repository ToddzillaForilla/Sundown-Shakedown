import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { characterList } from './index';

describe('character content packages', () => {
  it('registers unique fighter identifiers', () => {
    const ids = characterList.map((character) => character.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('provides valid stats and seven distinct contextual moves', () => {
    for (const character of characterList) {
      expect(character.stats.maxHealth).toBeGreaterThan(0);
      expect(character.stats.walkSpeed).toBeGreaterThan(0);
      const moves = Object.values(character.moves);
      expect(new Set(moves.map((move) => move.id)).size).toBe(7);
      for (const move of moves) {
        expect(move.damage).toBeGreaterThan(0);
        expect(move.range).toBeGreaterThan(0);
        expect(move.cooldownMs).toBeGreaterThan(0);
        expect(move.knockback).toBeGreaterThan(0);
      }
    }
  });

  it('keeps the approved themes assigned to the correct fighter', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(todd?.themes).toEqual(['hacking', 'video games', 'technology']);
    expect(kristen?.themes).toEqual(['plants', 'cooking', 'camping']);
  });

  it('normalizes Todd art direction and display size against Kristen', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(todd?.art.nativeFacing).toBe(-1);
    expect(todd?.art.renderScale).toBeCloseTo(0.91);
    expect(kristen?.art.nativeFacing ?? 1).toBe(1);
    expect(kristen?.art.renderScale ?? 1).toBe(1);
  });

  it('slices Todd animation sheets into exactly six complete frames', async () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const localPath = (url: URL) => decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1');
    const sheets = [
      {
        definition: todd?.art.idleSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-idle-sheet-v2-laptop.png', import.meta.url)),
      },
      {
        definition: todd?.art.walkSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-walk-sheet-v2-laptop.png', import.meta.url)),
      },
    ];

    for (const sheet of sheets) {
      expect(sheet.definition).toBeDefined();
      const metadata = await sharp(sheet.path).metadata();
      expect(metadata.width).toBe(sheet.definition!.frameWidth * sheet.definition!.frameCount);
      expect(metadata.height).toBe(sheet.definition!.frameHeight);
    }
  });
});

