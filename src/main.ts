import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, gameConfig } from './game/config';
import { fitGameViewport } from './game/layout';
import './styles.css';

const gameHost = document.querySelector<HTMLElement>('#game');

function sizeGameHost(): void {
  if (!gameHost || !window.matchMedia('(orientation: landscape)').matches) {
    gameHost?.style.removeProperty('width');
    gameHost?.style.removeProperty('height');
    return;
  }

  const viewport = window.visualViewport;
  const fitted = fitGameViewport(
    viewport?.width ?? window.innerWidth,
    viewport?.height ?? window.innerHeight,
    GAME_WIDTH,
    GAME_HEIGHT,
  );
  gameHost.style.width = `${fitted.width}px`;
  gameHost.style.height = `${fitted.height}px`;
}

sizeGameHost();
const game = new Phaser.Game(gameConfig);

function refreshGameLayout(): void {
  sizeGameHost();
  window.requestAnimationFrame(() => game.scale.refresh());
}

window.addEventListener('resize', refreshGameLayout);
window.addEventListener('orientationchange', () => {
  refreshGameLayout();
  window.setTimeout(refreshGameLayout, 150);
  window.setTimeout(refreshGameLayout, 450);
});
window.visualViewport?.addEventListener('resize', refreshGameLayout);

