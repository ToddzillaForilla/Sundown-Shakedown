import Phaser from 'phaser';
import { kristen } from '../../content/characters/kristen';
import { todd } from '../../content/characters/todd';
import { backyard } from '../../content/stages/backyard';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { createButton } from '../ui/button';

const TITLE_DEPTH = 10;

export class TitleScene extends Phaser.Scene {
  private isStarting = false;

  constructor() {
    super('TitleScene');
  }

  preload(): void {
    this.loadImageOnce(backyard.background.textureKey, backyard.background.url);
    this.loadImageOnce(todd.art.fighterTextureKey, todd.art.fighterUrl);
    this.loadImageOnce(kristen.art.fighterTextureKey, kristen.art.fighterUrl);
  }

  create(): void {
    this.isStarting = false;
    this.cameras.main.setBackgroundColor('#101c24');

    const background = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, backyard.background.textureKey)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.tweens.add({
      targets: background,
      scaleX: 1.035,
      scaleY: 1.035,
      duration: 12_000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07141c, 0.34);
    this.add.rectangle(GAME_WIDTH / 2, 42, GAME_WIDTH, 84, 0x081218, 0.42);
    this.add.rectangle(GAME_WIDTH / 2, 508, GAME_WIDTH, 64, 0x081218, 0.72);

    this.createFighter(todd.art.fighterTextureKey, 134, 356, false);
    this.createFighter(kristen.art.fighterTextureKey, 826, 356, true);
    this.createLogo();

    this.add
      .text(GAME_WIDTH / 2, 270, 'SUNDOWN DRIVE  •  CASTLE ROCK', {
        color: '#d9c8a8',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        letterSpacing: 3,
        stroke: '#17242c',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH);

    const startGlow = this.add
      .rectangle(GAME_WIDTH / 2, 365, 324, 78, 0xe4a85e, 0.13)
      .setDepth(TITLE_DEPTH);
    this.tweens.add({
      targets: startGlow,
      alpha: { from: 0.08, to: 0.28 },
      scaleX: { from: 0.97, to: 1.03 },
      scaleY: { from: 0.97, to: 1.03 },
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const startButton = createButton(this, GAME_WIDTH / 2, 365, 'PRESS START', () => this.startGame(), {
      width: 292,
      height: 64,
      fill: 0x304b42,
      hoverFill: 0x45695a,
      fontSize: 28,
    }).setDepth(TITLE_DEPTH + 1);

    this.add
      .text(GAME_WIDTH / 2, 411, 'ENTER  •  SPACE  •  TAP', {
        color: '#efe2c5',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        letterSpacing: 2,
        stroke: '#12212a',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH);

    this.add
      .text(GAME_WIDTH / 2, 510, 'MOVE  WASD / ARROWS     •     ATTACK  J / K / L     •     TOUCH READY', {
        color: '#c9d4cf',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        letterSpacing: 1,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH);

    this.tweens.add({
      targets: startButton,
      y: 362,
      duration: 1100,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
  }

  private createLogo(): void {
    const plaque = this.add.container(GAME_WIDTH / 2, 139).setDepth(TITLE_DEPTH);
    const shadow = this.add.rectangle(6, 8, 592, 188, 0x071118, 0.72);
    const outer = this.add.rectangle(0, 0, 592, 188, 0x243843, 0.94).setStrokeStyle(5, 0xb77a3f, 1);
    const inner = this.add.rectangle(0, 0, 574, 170, 0x172a33, 0.72).setStrokeStyle(2, 0xd7b16b, 0.72);
    plaque.add([shadow, outer, inner]);

    this.add
      .text(GAME_WIDTH / 2 + 4, 108, 'SUNDOWN', {
        color: '#08141b',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '68px',
        letterSpacing: 2,
        stroke: '#08141b',
        strokeThickness: 12,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH);
    this.add
      .text(GAME_WIDTH / 2, 102, 'SUNDOWN', {
        color: '#f1d49a',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '68px',
        letterSpacing: 2,
        stroke: '#37515c',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH + 1);
    this.add
      .text(GAME_WIDTH / 2, 174, 'SHAKEDOWN', {
        color: '#eef1e8',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '66px',
        letterSpacing: 1,
        stroke: '#743e2b',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(TITLE_DEPTH + 1);

    plaque.setAlpha(0).setScale(0.94);
    this.tweens.add({
      targets: plaque,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 420,
      ease: 'Back.easeOut',
    });
  }

  private createFighter(textureKey: string, x: number, y: number, flipX: boolean): void {
    const fighter = this.add
      .image(x, y, textureKey)
      .setDisplaySize(310, 465)
      .setFlipX(flipX)
      .setAlpha(0.92)
      .setDepth(5);
    fighter.setTint(0xe4eee9);

    this.tweens.add({
      targets: fighter,
      y: y - 7,
      duration: 1750 + (flipX ? 180 : 0),
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private startGame(): void {
    if (this.isStarting) return;
    this.isStarting = true;
    this.cameras.main.fadeOut(180, 10, 20, 24);
    this.time.delayedCall(180, () => this.scene.start('CharacterSelectScene'));
  }

  private loadImageOnce(textureKey: string, url: string): void {
    if (!this.textures.exists(textureKey)) {
      this.load.image(textureKey, url);
    }
  }
}
