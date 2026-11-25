import type Phaser from 'phaser';
import { showdownMusic } from '../content/audio';
import { GAME_WIDTH } from './config';

/** The same music control in selection and fights; the global sound retains its state. */
export function createMusicToggle(scene: Phaser.Scene): void {
  const music = scene.sound.get(showdownMusic.key) as
    Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | null;
  if (!music) return;
  // AudioParam values can lag a render quantum; keep the requested state across scenes.
  let muted = scene.registry.get('music-muted') === true;
  music.setMute(muted);

  const icon = scene.add.graphics({ x: GAME_WIDTH - 28, y: 25 }).setDepth(1000).setAlpha(0.65);
  const render = (): void => {
    icon.clear();
    // Transparent background, an outlined speaker, and waves or a mute slash.
    icon.lineStyle(2, 0x000000, 0.7);
    icon.strokeRect(-17, -5, 11, 12);
    icon.lineStyle(2, 0xfff8df, 1);
    icon.beginPath();
    icon.moveTo(-16, -5);
    icon.lineTo(-10, -5);
    icon.lineTo(-2, -12);
    icon.lineTo(-2, 12);
    icon.lineTo(-10, 5);
    icon.lineTo(-16, 5);
    icon.closePath();
    icon.strokePath();
    if (muted) {
      icon.lineStyle(4, 0x000000, 0.85);
      icon.lineBetween(-18, 17, 18, -17);
      icon.lineStyle(2.5, 0xfff8df, 1);
      icon.lineBetween(-18, 17, 18, -17);
    } else {
      for (const radius of [9, 16]) {
        icon.beginPath();
        icon.arc(0, 0, radius, -Math.PI / 3, Math.PI / 3);
        icon.strokePath();
      }
    }
  };
  const toggle = (): void => {
    muted = !muted;
    scene.registry.set('music-muted', muted);
    music.setMute(muted);
    render();
  };
  scene.add.zone(GAME_WIDTH - 30, 29, 60, 58)
    .setDepth(1001)
    .setInteractive({ useHandCursor: true })
    // Consume the press so clicking music does not also trigger a combat attack.
    .on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    })
    .on('pointerup', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      toggle();
    })
    .on('pointerover', () => icon.setAlpha(1))
    .on('pointerout', () => icon.setAlpha(0.65));
  scene.input.keyboard?.on('keydown-M', (event: KeyboardEvent) => {
    if (!event.repeat) toggle();
  });
  render();
}
