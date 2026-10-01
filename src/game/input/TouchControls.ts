import Phaser from 'phaser';

export type TouchAction = 'left' | 'right' | 'down' | 'jump' | 'light' | 'heavy' | 'super';
type DPadDirection = 'up' | 'down' | 'left' | 'right';

export class TouchControls {
  private readonly held = new Map<TouchAction, boolean>();
  private readonly pressed = new Map<TouchAction, boolean>();
  private readonly superButton: Phaser.GameObjects.Container;
  private superAvailable = false;

  constructor(scene: Phaser.Scene) {
    this.createDPad(scene, 142, 425);

    const actionCenterX = 826;
    const actionCenterY = 420;
    const actionSpacing = 68;
    const actionRadius = 43;
    this.createRoundButton(scene, actionCenterX - actionSpacing, actionCenterY, 'LOW', 'light', actionRadius, 0x2f7898, 14);
    this.createRoundButton(scene, actionCenterX, actionCenterY - actionSpacing, 'HIGH', 'heavy', actionRadius, 0x9a365c, 14);
    this.superButton = this.createRoundButton(
      scene,
      actionCenterX + actionSpacing,
      actionCenterY,
      'SUPER',
      'super',
      actionRadius,
      0xd28a23,
      13,
    );
    this.createRoundButton(scene, actionCenterX, actionCenterY + actionSpacing, 'JUMP', 'jump', actionRadius, 0x4b8b54, 14);
    this.setSuperAvailable(false);
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
    this.superAvailable = available;
    this.superButton.setAlpha(available ? 1 : 0.34);
    if (!available) {
      this.held.set('super', false);
      this.pressed.set('super', false);
      this.superButton.setScale(1);
    }
  }

  private createDPad(scene: Phaser.Scene, centerX: number, centerY: number): void {
    const size = 68;
    this.createDPadButton(scene, centerX, centerY - size, 'up', undefined, size);
    this.createDPadButton(scene, centerX - size, centerY, 'left', 'left', size);
    this.createDPadButton(scene, centerX + size, centerY, 'right', 'right', size);
    this.createDPadButton(scene, centerX, centerY + size, 'down', 'down', size);

    const shadow = scene.add.rectangle(4, 5, size, size, 0x020508, 0.34);
    const center = scene.add.rectangle(0, 0, size, size, 0x111a27, 0.46)
      .setStrokeStyle(3, 0xc8d2da, 0.32);
    const inset = scene.add.rectangle(0, -2, size - 12, size - 12, 0x8fa5b5, 0.06)
      .setStrokeStyle(1, 0xe8eef2, 0.12);
    const pivot = scene.add.circle(0, 0, 7, 0x05090f, 0.34)
      .setStrokeStyle(1, 0xdde5ea, 0.16);
    scene.add.container(centerX, centerY, [shadow, center, inset, pivot])
      .setScrollFactor(0)
      .setDepth(99);
  }

  private createDPadButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: DPadDirection,
    action: TouchAction | undefined,
    size: number,
  ): Phaser.GameObjects.Container {
    const shadow = scene.add.rectangle(4, 5, size, size, 0x020508, 0.34);
    const face = scene.add.rectangle(0, 0, size, size, 0x172437, 0.46)
      .setStrokeStyle(3, 0xc8d2da, action ? 0.38 : 0.24);
    if (action) face.setInteractive({ useHandCursor: true });
    const inset = scene.add.rectangle(0, -2, size - 12, size - 12, 0x8fa5b5, 0.07)
      .setStrokeStyle(1, 0xe8eef2, 0.14);
    const arrowPoints: Record<DPadDirection, [number, number, number, number, number, number]> = {
      up: [-11, 8, 0, -10, 11, 8],
      down: [-11, -8, 0, 10, 11, -8],
      left: [8, -11, -10, 0, 8, 11],
      right: [-8, -11, 10, 0, -8, 11],
    };
    const [x1, y1, x2, y2, x3, y3] = arrowPoints[direction];
    const arrow = scene.add.graphics().setPosition(0, -1).setAlpha(action ? 0.82 : 0.38);
    arrow.fillStyle(0xeaf0f2, 1);
    arrow.fillTriangle(x1, y1, x2, y2, x3, y3);
    const container = scene.add.container(x, y, [shadow, face, inset, arrow])
      .setScrollFactor(0)
      .setDepth(100);

    if (!action) return container;

    face.on('pointerdown', () => {
      this.held.set(action, true);
      this.pressed.set(action, true);
      face.setFillStyle(0x263b55, 0.62);
      inset.setFillStyle(0xb9cada, 0.13);
      container.setScale(0.94);
    });
    const release = (): void => {
      this.held.set(action, false);
      face.setFillStyle(0x172437, 0.46);
      inset.setFillStyle(0x8fa5b5, 0.07);
      container.setScale(1);
    };
    face.on('pointerup', release);
    face.on('pointerout', release);
    return container;
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
      if (action === 'super' && !this.superAvailable) return;
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

