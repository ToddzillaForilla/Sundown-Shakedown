import Phaser from 'phaser';

export type TouchAction = 'left' | 'right' | 'up' | 'down' | 'light' | 'heavy' | 'super';

export class TouchControls {
  private readonly held = new Map<TouchAction, boolean>();
  private readonly pressed = new Map<TouchAction, boolean>();
  private readonly superButton: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.createRoundButton(scene, 92, 455, '◀', 'left', 48, 0x273451);
    this.createRoundButton(scene, 202, 455, '▶', 'right', 48, 0x273451);
    this.createRoundButton(scene, 147, 402, '▲', 'up', 42, 0x273451);
    this.createRoundButton(scene, 147, 505, '▼', 'down', 42, 0x273451);
    this.createRoundButton(scene, 752, 458, 'L', 'light', 54, 0x2f7898);
    this.createRoundButton(scene, 872, 430, 'H', 'heavy', 62, 0x9a365c);
    this.superButton = this.createRoundButton(scene, 835, 332, 'SUPER', 'super', 48, 0xd28a23, 16);
    this.superButton.setVisible(false);
  }

  isHeld(action: TouchAction): boolean {
    return this.held.get(action) ?? false;
  }

  consumePress(action: TouchAction): boolean {
    const value = this.pressed.get(action) ?? false;
    this.pressed.set(action, false);
    return value;
  }

  setSuperAvailable(available: boolean): void {
    this.superButton.setVisible(available);
  }

  private createRoundButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    action: TouchAction,
    radius: number,
    color: number,
    fontSize = 26,
  ): Phaser.GameObjects.Container {
    const circle = scene.add.circle(0, 0, radius, color, 0.72)
      .setStrokeStyle(3, 0xffe1a1, 0.7)
      .setInteractive({ useHandCursor: true });
    const text = scene.add.text(0, 0, label, {
      color: '#fff8df',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const container = scene.add.container(x, y, [circle, text]).setScrollFactor(0).setDepth(100);

    circle.on('pointerdown', () => {
      this.held.set(action, true);
      this.pressed.set(action, true);
      container.setScale(0.92);
    });
    const release = (): void => {
      this.held.set(action, false);
      container.setScale(1);
    };
    circle.on('pointerup', release);
    circle.on('pointerout', release);
    return container;
  }
}

