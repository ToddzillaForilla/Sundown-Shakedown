import { describe, expect, it } from 'vitest';
import { characters } from '../../content/characters';
import { getReactionNativeFacing } from './FighterPresentation';

describe('fighter reaction facing', () => {
  it('uses Todd’s dedicated block sheet facing when a blocked hit plays it', () => {
    const todd = characters.todd;

    expect(todd.art.blockSheet?.animationKey).toBe('fighter-todd-block-v1');
    expect(todd.art.blockSheet?.nativeFacing).toBe(-1);
    expect(todd.art.reactionSheet).toBeUndefined();
    expect(getReactionNativeFacing(todd, true)).toBe(-1);
  });

  it('uses the authored hit sheet facing for unblocked reactions', () => {
    expect(getReactionNativeFacing(characters.todd, false)).toBe(characters.todd.art.hitSheet?.nativeFacing);
  });
});
