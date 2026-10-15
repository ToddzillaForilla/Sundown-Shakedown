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
    expect(kristen?.art.renderScale).toBeCloseTo(0.96);
  });

  it('slices fighter animation sheets into exactly six complete frames', async () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');
    const localPath = (url: URL) => decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1');
    const sheets = [
      {
        definition: todd?.art.idleSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-idle-sheet-v2-laptop.png', import.meta.url)),
      },
      {
        definition: todd?.art.walkSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-walk-sheet-v5-idle-scale.png', import.meta.url)),
      },
      {
        definition: todd?.art.kickAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-kick-attack-sheet-v3-mid-side.png', import.meta.url)),
      },
      {
        definition: todd?.art.punchAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-punch-attack-sheet-v7-arm-continuity.png', import.meta.url)),
      },
      {
        definition: todd?.art.crouchPunchAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-crouch-punch-attack-sheet-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.reactionSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-reactions-sheet-v1.png', import.meta.url)),
      },
      {
        definition: kristen?.art.idleSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-idle-sheet-v1.png', import.meta.url)),
      },
      {
        definition: kristen?.art.walkSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-walk-sheet-v1-hands-free.png', import.meta.url)),
      },
      {
        definition: kristen?.art.kickAttackSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-kick-attack-sheet-v2.png', import.meta.url)),
      },
      {
        definition: kristen?.art.punchAttackSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-punch-attack-sheet-v3.png', import.meta.url)),
      },
      {
        definition: kristen?.art.reactionSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-reactions-sheet-v1.png', import.meta.url)),
      },
    ];

    for (const sheet of sheets) {
      expect(sheet.definition).toBeDefined();
      const metadata = await sharp(sheet.path).metadata();
      expect(metadata.width).toBe(sheet.definition!.frameWidth * sheet.definition!.frameCount);
      expect(metadata.height).toBe(sheet.definition!.frameHeight);
    }
  });

  it('assigns distinct complete frame ranges to block, hit, and landing reactions', () => {
    for (const character of characterList) {
      const reactions = character.art.reactionSheet;
      expect(reactions).toBeDefined();
      const clips = [reactions!.block, reactions!.hit, reactions!.landing];
      const usedFrames = clips.flatMap((clip) =>
        Array.from({ length: clip.endFrame - clip.startFrame + 1 }, (_, index) => clip.startFrame + index),
      );

      expect(usedFrames).toEqual([0, 1, 2, 3, 4, 5]);
      expect(new Set(usedFrames).size).toBe(reactions!.frameCount);
    }
  });

  it('records reaction-sheet facing when it differs from the fighter base art', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(todd?.art.nativeFacing).toBe(-1);
    expect(todd?.art.reactionSheet?.nativeFacing).toBe(1);
    expect(todd?.art.kickAttackSheet?.nativeFacing).toBe(1);
    expect(todd?.art.punchAttackSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.crouchPunchAttackSheet?.nativeFacing).toBe(1);
    expect(kristen?.art.reactionSheet?.nativeFacing ?? 1).toBe(1);
  });
});

