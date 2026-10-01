export interface FittedViewport {
  width: number;
  height: number;
}

export function fitGameViewport(
  viewportWidth: number,
  viewportHeight: number,
  gameWidth: number,
  gameHeight: number,
): FittedViewport {
  const scale = Math.min(viewportWidth / gameWidth, viewportHeight / gameHeight);
  return {
    width: Math.floor(gameWidth * scale),
    height: Math.floor(gameHeight * scale),
  };
}
