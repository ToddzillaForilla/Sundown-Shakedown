import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { createButton } from '../ui/button';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#170f2a');

    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x3d1c55, 0x3d1c55, 0xec784f, 0xec784f, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fillStyle(0x1d2d3f, 1);
    graphics.fillTriangle(0, 350, 230, 150, 410, 350);
    graphics.fillTriangle(260, 350, 545, 105, 775, 350);
    graphics.fillTriangle(610, 350, 840, 175, 960, 350);
    graphics.fillStyle(0x16211d, 1);
    graphics.fillRect(0, 340, GAME_WIDTH, 200);

    this.add
      .text(GAME_WIDTH / 2 + 5, 117, 'SUNDOWN', {
        color: '#190f25',
        fontFamily: 'Impact, sans-serif',
        fontSize: '80px',
        stroke: '#190f25',
        strokeThickness: 14,
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 110, 'SUNDOWN', {
        color: '#ffd36a',
        fontFamily: 'Impact, sans-serif',
        fontSize: '80px',
        stroke: '#6e223e',
        strokeThickness: 7,
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 196, 'SHAKEDOWN', {
        color: '#fff4d0',
        fontFamily: 'Impact, sans-serif',
        fontSize: '86px',
        stroke: '#231334',
        strokeThickness: 9,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 278, 'A NEIGHBORHOOD FIGHTING GAME', {
        color: '#f6c9a9',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '19px',
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    createButton(this, GAME_WIDTH / 2, 386, 'START SHAKEDOWN', () => {
      this.scene.start('CharacterSelectScene');
    }, { width: 300, height: 66, fontSize: 27 });

    this.add
      .text(GAME_WIDTH / 2, 478, 'WASD / ARROWS  •  J K L  •  MOUSE ATTACKS  •  TOUCH', {
        color: '#bba9c5',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start('CharacterSelectScene');
    });
  }
}

