import type { CharacterDefinition } from '../../content/characters';

export function getReactionNativeFacing(
  character: CharacterDefinition,
  blocked: boolean,
): 1 | -1 | undefined {
  const art = character.art;
  return blocked
    ? art.blockSheet?.nativeFacing ?? art.reactionSheet?.nativeFacing
    : art.hitSheet?.nativeFacing ?? art.reactionSheet?.nativeFacing;
}
