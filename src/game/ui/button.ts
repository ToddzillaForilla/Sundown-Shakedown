import Phaser from 'phaser';

interface ButtonOptions {
  width?: number;
  height?: number;
  fill?: number;
  hoverFill?: number;
  fontSize?: number;
}

export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onPress: () => void,
  options: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const width = options.width ?? 240;
  const height = options.height ?? 58;
  const fill = options.fill ?? 0x6b2b59;
  const hoverFill = options.hoverFill ?? 0x914377;

  const background = scene.add
    .rectangle(0, 0, width, height, fill, 0.96)
    .setStrokeStyle(3, 0xffd477)
    .setInteractive({ useHandCursor: true });
  const text = scene.add
    .text(0, 0, label, {
      color: '#fff8df',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: `${options.fontSize ?? 25}px`,
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const container = scene.add.container(x, y, [background, text]);
  background.on('pointerover', () => background.setFillStyle(hoverFill, 1));
  background.on('pointerout', () => background.setFillStyle(fill, 0.96));
  background.on('pointerdown', () => {
    container.setScale(0.97);
  });
  background.on('pointerup', () => {
    container.setScale(1);
    onPress();
  });
  return container;
}

