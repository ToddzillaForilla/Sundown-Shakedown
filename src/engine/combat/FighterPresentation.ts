import type { CharacterDefinition } from '../../content/characters';

export function getAnimationNativeFacing(
  character: CharacterDefinition,
  animationKey?: string,
): 1 | -1 | undefined {
  const art = character.art;
  const sheet = Object.values(art).find((value) =>
    value !== null && typeof value === 'object'
    && 'animationKey' in value && value.animationKey === animationKey,
  );
  if (sheet && typeof sheet === 'object' && 'nativeFacing' in sheet) return sheet.nativeFacing;
  const reactions = art.reactionSheet;
  if (animationKey && reactions && [reactions.block, reactions.hit, reactions.landing]
    .some((clip) => clip?.animationKey === animationKey)) return reactions.nativeFacing;
  return art.nativeFacing;
}

export function getReactionNativeFacing(
  character: CharacterDefinition,
  blocked: boolean,
): 1 | -1 | undefined {
  const art = character.art;
  return blocked
    ? art.blockSheet?.nativeFacing ?? art.reactionSheet?.nativeFacing
    : art.hitSheet?.nativeFacing ?? art.reactionSheet?.nativeFacing;
}
