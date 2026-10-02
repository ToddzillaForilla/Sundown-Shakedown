import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

const TITLE_DEPTH = 10;
const PIXEL_FONT = '"Courier New", Courier, monospace';

export class TitleScene extends Phaser.Scene {
  private isStarting = false;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.isStarting = false;
    this.cameras.main.setBackgroundColor('#000000');
    this.createCabinetBackdrop();
    this.createArcadeLogo();
    this.createStartMenu();
    this.createControlLegend();

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
  }

  private createCabinetBackdrop(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setDepth(0);

    const scanlines = this.add.graphics().setDepth(1).setAlpha(0.16);
    scanlines.lineStyle(1, 0x2d1738, 0.38);
    for (let y = 1; y < GAME_HEIGHT; y += 4) scanlines.lineBetween(0, y, GAME_WIDTH, y);

    const glow = this.add.ellipse(GAME_WIDTH / 2, 174, 670, 290, 0x741328, 0.1).setDepth(2);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.06, to: 0.16 },
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createArcadeLogo(): void {
    this.add
      .text(GAME_WIDTH / 2 + 8, 116, 'SUNDOWN', {
        color: '#280004',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '80px',
        fontStyle: 'italic',
        letterSpacing: 3,
        stroke: '#280004',
        strokeThickness: 13,
      })
      .setPadding(24, 10, 32, 10)
      .setOrigin(0.5)
      .setAngle(-5)
      .setDepth(TITLE_DEPTH);

    this.add
      .text(GAME_WIDTH / 2, 107, 'SUNDOWN', {
        color: '#ffd11a',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '80px',
        fontStyle: 'italic',
        letterSpacing: 3,
        stroke: '#d31a16',
        strokeThickness: 8,
      })
      .setPadding(24, 10, 32, 10)
      .setOrigin(0.5)
      .setAngle(-5)
      .setDepth(TITLE_DEPTH + 1);

    this.add
      .text(GAME_WIDTH / 2 + 8, 193, 'SHAKEDOWN', {
        color: '#230005',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '78px',
        fontStyle: 'italic',
        letterSpacing: 2,
        stroke: '#230005',
        strokeThickness: 14,
      })
      .setPadding(24, 10, 32, 10)
      .setOrigin(0.5)
      .setAngle(-4)
      .setDepth(TITLE_DEPTH);

    this.add
      .text(GAME_WIDTH / 2, 183, 'SHAKEDOWN', {
        color: '#ffb000',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '78px',
        fontStyle: 'italic',
        letterSpacing: 2,
        stroke: '#b20f1e',
        strokeThickness: 8,
      })
      .setPadding(24, 10, 32, 10)
      .setOrigin(0.5)
      .setAngle(-4)
      .setDepth(TITLE_DEPTH + 1);

    this.add
      .text(GAME_WIDTH / 2, 249, 'NEIGHBORHOOD COMBAT', {
        color: '#f4f0ff',
        fontFamily: PIXEL_FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        letterSpacing: 5,
        stroke: '#5c1d75',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH + 1);
  }

  private createStartMenu(): void {
    const start = this.add
      .text(GAME_WIDTH / 2, 332, 'PRESS START', {
        color: '#f8f5ff',
        fontFamily: PIXEL_FONT,
        fontSize: '26px',
        fontStyle: 'bold',
        letterSpacing: 4,
        stroke: '#6a236f',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH + 1);

    this.tweens.add({
      targets: start,
      alpha: { from: 1, to: 0.5 },
      duration: 650,
      ease: 'Stepped',
      yoyo: true,
      repeat: -1,
    });

    this.add.zone(GAME_WIDTH / 2, 332, 390, 86)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.startGame());
  }

  private createControlLegend(): void {
    this.add
      .text(GAME_WIDTH / 2, 414, 'MOVE WASD  |  KICK J  |  PUNCH K  |  SPECIAL I  |  JUMP L', {
        color: '#f6e6e8',
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH);

    this.add
      .text(42, 506, '© 2026 SUNDOWN SHAKEDOWN', {
        color: '#f0a300',
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setDepth(TITLE_DEPTH);

    this.add
      .text(GAME_WIDTH - 42, 506, 'CREDIT  1', {
        color: '#f6e6e8',
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5)
      .setDepth(TITLE_DEPTH);
  }

  private startGame(): void {
    if (this.isStarting) return;
    this.isStarting = true;
    this.cameras.main.flash(70, 255, 210, 80);
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.time.delayedCall(180, () => this.scene.start('CharacterSelectScene'));
  }
}
