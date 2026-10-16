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
    expect(kristen?.art.idleSheet?.nativeFacing).toBe(-1);
    expect(kristen?.art.renderScale).toBeCloseTo(0.96);
  });

  it('slices fighter animation sheets into complete frames', async () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');
    const localPath = (url: URL) => decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1');
    const sheets = [
      {
        definition: todd?.art.idleSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-idle-hands-free-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.walkSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-walk-hands-free-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.jumpSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-jump-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.landingSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-jump-recovery-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.crouchSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-crouch-retro-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.airKickAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-jump-kick-retro-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.airPunchAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-jump-punch-retro-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.blockSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-block-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.kickAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-kick-retro-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.punchAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-punch-left-75-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.alternatePunchAttackSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-punch-right-25-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.hitSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-hit-reaction-v1.png', import.meta.url)),
      },
      {
        definition: todd?.art.defeatSheet,
        path: localPath(new URL('./todd/assets/sprites/todd-defeat-ko-v1.png', import.meta.url)),
      },
      {
        definition: kristen?.art.idleSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-idle-retro-v1.png', import.meta.url)),
      },
      {
        definition: kristen?.art.walkSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-walk-direction-combo-v1.png', import.meta.url)),
      },
      {
        definition: kristen?.art.walkLeftSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-walk-direction-combo-v1.png', import.meta.url)),
      },
      {
        definition: kristen?.art.kickAttackSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-kick-attack-sheet-v2.png', import.meta.url)),
      },
      {
        definition: kristen?.art.punchAttackSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-punch-main-75-1792159772322.png', import.meta.url)),
      },
      {
        definition: kristen?.art.alternatePunchAttackSheet,
        path: localPath(new URL('./kristen/assets/sprites/kristen-punch-alt-25-1792159502161.png', import.meta.url)),
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

  it('assigns distinct complete frame ranges to configured reactions', () => {
    for (const character of characterList) {
      const reactions = character.art.reactionSheet;
      if (!reactions) continue;
      const clips = [reactions!.block, reactions!.hit, reactions!.landing].filter(
        (clip): clip is NonNullable<typeof clip> => clip !== undefined,
      );
      const usedFrames = clips.flatMap((clip) =>
        Array.from({ length: clip.endFrame - clip.startFrame + 1 }, (_, index) => clip.startFrame + index),
      );

      expect(usedFrames).toEqual([0, 1, 2, 3, 4, 5]);
      expect(new Set(usedFrames).size).toBe(usedFrames.length);
    }
  });

  it('records reaction-sheet facing when it differs from the fighter base art', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(todd?.art.nativeFacing).toBe(-1);
    expect(todd?.art.kickAttackSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.crouchSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.airKickAttackSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.airPunchAttackSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.punchAttackSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.alternatePunchAttackSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.hitSheet?.nativeFacing).toBe(-1);
    expect(kristen?.art.reactionSheet?.nativeFacing ?? 1).toBe(1);
  });

  it('maps Todd to the approved movement, defense, jump, and weighted punch art', () => {
    const todd = characterList.find((character) => character.id === 'todd');

    expect(todd?.art.idleSheet?.animationKey).toBe('fighter-todd-idle-hands-free-v1');
    expect(todd?.art.walkSheet?.animationKey).toBe('fighter-todd-walk-hands-free-v1');
    expect(todd?.art.jumpSheet?.animationKey).toBe('fighter-todd-jump-v1');
    expect(todd?.art.landingSheet?.animationKey).toBe('fighter-todd-jump-recovery-v1');
    expect(todd?.art.landingSheet?.frameCount).toBe(4);
    expect(todd?.art.landingSheet?.frameRate).toBe(18);
    expect(todd?.art.landingSheet?.nativeFacing).toBe(-1);
    expect(todd?.art.crouchSheet?.animationKey).toBe('fighter-todd-crouch-retro-v1');
    expect(todd?.art.crouchHoldFrame).toBe(2);
    expect(todd?.art.airKickAttackSheet?.animationKey).toBe('fighter-todd-jump-kick-retro-v1');
    expect(todd?.art.airPunchAttackSheet?.animationKey).toBe('fighter-todd-jump-punch-retro-v1');
    expect(todd?.art.blockSheet?.animationKey).toBe('fighter-todd-block-v1');
    expect(todd?.art.blockHoldFrame).toBe(2);
    expect(todd?.art.reactionSheet).toBeUndefined();
    expect(todd?.art.punchAttackSheet?.animationKey).toBe('fighter-todd-punch-left-75-v1');
    expect(todd?.art.alternatePunchAttackSheet?.animationKey).toBe('fighter-todd-punch-right-25-v1');
    expect(todd?.art.alternatePunchChance).toBe(0.25);
    expect(todd?.art.punchAttackSheet?.nativeFacing).toBe(-1);
  });

  it('maps Todd’s approved hit reaction to the nine-frame authored clip', () => {
    const hit = characterList.find((character) => character.id === 'todd')?.art.hitSheet;

    expect(hit?.animationKey).toBe('fighter-todd-hit-reaction-v1');
    expect(hit?.frameCount).toBe(9);
    expect(hit?.frameRate).toBe(24);
    expect((hit!.frameCount / hit!.frameRate) * 1000).toBeCloseTo(375);
  });

  it('maps Todd’s approved knockout to the nine-frame authored defeat clip', () => {
    const defeat = characterList.find((character) => character.id === 'todd')?.art.defeatSheet;

    expect(defeat?.animationKey).toBe('fighter-todd-defeat-ko-v1');
    expect(defeat?.frameCount).toBe(9);
    expect(defeat?.frameRate).toBe(16);
    expect(defeat?.nativeFacing).toBe(-1);
  });

  it('keeps Todd punches within the existing heavy-attack lock duration', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const punchDuration = (todd!.art.punchAttackSheet!.frameCount / todd!.art.punchAttackSheet!.frameRate) * 1000;
    const alternateDuration = (todd!.art.alternatePunchAttackSheet!.frameCount / todd!.art.alternatePunchAttackSheet!.frameRate) * 1000;

    expect(todd!.art.punchAttackSheet!.frameCount).toBe(9);
    expect(todd!.art.alternatePunchAttackSheet!.frameCount).toBe(9);
    expect(todd!.art.punchAttackSheet!.frameRate).toBe(24);
    expect(todd!.art.alternatePunchAttackSheet!.frameRate).toBe(24);
    expect(punchDuration).toBeCloseTo(375);
    expect(alternateDuration).toBeCloseTo(375);
    expect(punchDuration).toBeLessThanOrEqual(todd!.moves.heavy.cooldownMs);
    expect(alternateDuration).toBeLessThanOrEqual(todd!.moves.heavy.cooldownMs);
  });

  it('keeps the approved Todd kick duration equal to the previous runtime clip', () => {
    const todd = characterList.find((character) => character.id === 'todd');
    const kickDuration = (todd!.art.kickAttackSheet!.frameCount / todd!.art.kickAttackSheet!.frameRate) * 1000;
    const previousKickDuration = (6 / 22) * 1000;

    expect(todd?.art.kickAttackSheet?.animationKey).toBe('fighter-todd-kick-retro-v1');
    expect(kickDuration).toBeCloseTo(previousKickDuration, 1);
    expect(kickDuration).toBeLessThan(todd!.moves.crouchLight.cooldownMs);
  });

  it('keeps Todd air attack clips within their existing cooldowns', () => {
    const todd = characterList.find((character) => character.id === 'todd')!;
    const airKickDuration = (todd.art.airKickAttackSheet!.frameCount / todd.art.airKickAttackSheet!.frameRate) * 1000;
    const airPunchDuration = (todd.art.airPunchAttackSheet!.frameCount / todd.art.airPunchAttackSheet!.frameRate) * 1000;

    expect(airKickDuration).toBeLessThanOrEqual(todd.moves.airLight.cooldownMs);
    expect(airPunchDuration).toBeLessThanOrEqual(todd.moves.airHeavy.cooldownMs);
  });

  it('uses the selected Kristen punch as the primary clip and a 25 percent alternate', () => {
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(kristen?.art.punchAttackSheet?.animationKey).toBe('fighter-kristen-punch-main-75-v1');
    expect(kristen?.art.alternatePunchAttackSheet?.animationKey).toBe('fighter-kristen-punch-alt-25-v1');
    expect(kristen?.art.alternatePunchChance).toBe(0.25);
    expect(kristen?.art.punchAttackSheet?.nativeFacing).toBe(-1);
    expect(kristen?.art.alternatePunchAttackSheet?.nativeFacing).toBe(-1);
  });

  it('plays Kristen’s approved walk combo forward to the right and in reverse to the left', () => {
    const kristen = characterList.find((character) => character.id === 'kristen');

    expect(kristen?.art.walkSheet?.animationKey).toBe('fighter-kristen-walk-right-retro-v1');
    expect(kristen?.art.walkLeftSheet?.animationKey).toBe('fighter-kristen-walk-left-retro-v1');
    expect(kristen?.art.walkLeftSheet?.textureKey).toBe(kristen?.art.walkSheet?.textureKey);
    expect(kristen?.art.walkSheet?.frameCount).toBe(9);
    expect(kristen?.art.walkSheet?.nativeFacing).toBe(-1);
    expect(kristen?.art.walkLeftSheet?.frameOrder).toEqual([0, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(kristen?.art.walkLeftSheet?.nativeFacing).toBe(-1);
  });
});

