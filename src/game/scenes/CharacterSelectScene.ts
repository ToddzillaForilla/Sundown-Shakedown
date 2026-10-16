import Phaser from 'phaser';
import { characterList, type CharacterDefinition } from '../../content/characters';
import type { Difficulty } from '../session';
import { applyFightSelection, gameSession } from '../session';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

const PIXEL_FONT = '"Courier New", Courier, monospace';
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

interface CharacterCard {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  portrait: Phaser.GameObjects.Image;
  frame: Phaser.GameObjects.Graphics;
  nameplate: Phaser.GameObjects.Rectangle;
  name: Phaser.GameObjects.Text;
  tagline: Phaser.GameObjects.Text;
  badge: Phaser.GameObjects.Text;
}

export class CharacterSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private difficultyIndex = 1;
  private characterCards: CharacterCard[] = [];
  private difficultyOptions: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('CharacterSelectScene');
  }

  preload(): void {
    for (const character of characterList) {
      if (!this.textures.exists(character.art.portraitTextureKey)) {
        this.load.image(character.art.portraitTextureKey, character.art.portraitUrl);
      }
    }
  }

  create(): void {
    this.characterCards = [];
    this.difficultyOptions = [];

    this.createCabinetBackdrop();
    this.createHeader();
    this.createCharacterRoster();
    this.createDifficultySelector();
    this.createFightButton();

    this.input.keyboard?.on('keydown-LEFT', () => this.changeCharacter(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeCharacter(1));
    this.input.keyboard?.on('keydown-UP', () => this.changeDifficulty(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.changeDifficulty(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.startFight());

    this.renderSelection();
  }

  private createCabinetBackdrop(): void {
    this.cameras.main.setBackgroundColor('#000000');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000);

    const glow = this.add.ellipse(GAME_WIDTH / 2, 236, 720, 390, 0x741328, 0.08);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.04, to: 0.11 },
      duration: 1700,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const scanlines = this.add.graphics().setAlpha(0.16);
    scanlines.lineStyle(1, 0x2d1738, 0.38);
    for (let y = 1; y < GAME_HEIGHT; y += 4) scanlines.lineBetween(0, y, GAME_WIDTH, y);
  }

  private createHeader(): void {
    this.add
      .text(GAME_WIDTH / 2, 44, 'SELECT YOUR FIGHTER', {
        color: '#ffb000',
        fontFamily: 'Impact, Haettenschweiler, sans-serif',
        fontSize: '43px',
        fontStyle: 'italic',
        letterSpacing: 2,
        stroke: '#b20f1e',
        strokeThickness: 7,
      })
      .setPadding(18, 8, 24, 8)
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 83, 'PLAYER 1', {
        color: '#f4f0ff',
        fontFamily: PIXEL_FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        letterSpacing: 4,
        stroke: '#5c1d75',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
  }

  private createCharacterRoster(): void {
    const spacing = 320;
    const startX = GAME_WIDTH / 2 - ((characterList.length - 1) * spacing) / 2;

    characterList.forEach((character, index) => {
      const card = this.createCharacterCard(character, startX + index * spacing, 242, index);
      this.characterCards.push(card);
    });
  }

  private createCharacterCard(
    character: CharacterDefinition,
    x: number,
    y: number,
    index: number,
  ): CharacterCard {
    const background = this.add
      .rectangle(0, 0, 228, 300, 0x08090b, 0.98)
      .setStrokeStyle(2, 0x74828d, 0.95)
      .setInteractive({ useHandCursor: true });

    const portrait = this.add
      .image(0, -17, character.art.portraitTextureKey)
      .setDisplaySize(200, 200);

    const frame = this.add.graphics();
    const nameplate = this.add
      .rectangle(0, 123, 190, 34, 0xc8bd96, 1)
      .setStrokeStyle(2, 0x9c7c3d, 1);

    const name = this.add
      .text(0, 117, character.displayName.toUpperCase(), {
        color: '#241b16',
        fontFamily: PIXEL_FONT,
        fontSize: '20px',
        fontStyle: 'bold',
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const tagline = this.add
      .text(0, 143, character.tagline.toUpperCase(), {
        align: 'center',
        color: '#c5bba8',
        fontFamily: PIXEL_FONT,
        fontSize: '8px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const badge = this.add
      .text(-100, -112, 'P1\nREADY', {
        color: '#ffca55',
        backgroundColor: '#171417',
        fontFamily: PIXEL_FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        lineSpacing: -2,
        padding: { x: 4, y: 3 },
      })
      .setOrigin(0, 0.5);

    const container = this.add.container(x, y, [background, portrait, frame, nameplate, name, tagline, badge]);
    background.on('pointerup', () => {
      this.selectedIndex = index;
      this.renderSelection();
    });

    return { container, background, portrait, frame, nameplate, name, tagline, badge };
  }

  private createDifficultySelector(): void {
    this.add
      .text(333, 414, 'DIFFICULTY', {
        color: '#8f8188',
        fontFamily: PIXEL_FONT,
        fontSize: '11px',
        fontStyle: 'bold',
        letterSpacing: 2,
      })
      .setOrigin(1, 0.5);

    const positions = [395, 480, 565];
    DIFFICULTIES.forEach((difficulty, index) => {
      const option = this.add
        .text(positions[index], 414, difficulty.toUpperCase(), {
          color: '#776b71',
          fontFamily: PIXEL_FONT,
          fontSize: '12px',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      option.on('pointerup', () => {
        this.difficultyIndex = index;
        this.renderSelection();
      });
      this.difficultyOptions.push(option);
    });
  }

  private createFightButton(): void {
    const background = this.add
      .rectangle(0, 0, 230, 54, 0x23060b, 0.98)
      .setStrokeStyle(3, 0xd31a16, 1)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(0, 0, 'FIGHT', {
        color: '#ffb000',
        fontFamily: PIXEL_FONT,
        fontSize: '22px',
        fontStyle: 'bold',
        letterSpacing: 4,
      })
      .setOrigin(0.5);
    const button = this.add.container(GAME_WIDTH / 2, 482, [background, label]);

    background.on('pointerover', () => background.setFillStyle(0x4a0b13, 1));
    background.on('pointerout', () => background.setFillStyle(0x23060b, 0.98));
    background.on('pointerdown', () => button.setScale(0.97));
    background.on('pointerup', () => {
      button.setScale(1);
      this.startFight();
    });
  }

  private changeCharacter(direction: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, characterList.length);
    this.renderSelection();
  }

  private changeDifficulty(direction = 1): void {
    this.difficultyIndex = Phaser.Math.Wrap(this.difficultyIndex + direction, 0, DIFFICULTIES.length);
    this.renderSelection();
  }

  private renderSelection(): void {
    this.characterCards.forEach((card, index) => {
      const selected = index === this.selectedIndex;
      card.background
        .setFillStyle(selected ? 0x11100d : 0x08090b, 0.98)
        .setStrokeStyle(selected ? 3 : 2, selected ? 0xe5ac4a : 0x74828d, 1);
      card.portrait.setAlpha(selected ? 1 : 0.76);
      card.frame.clear();
      card.frame.lineStyle(2, selected ? 0xf2bd59 : 0x8796a2, 1);
      card.frame.strokeRect(-105, -126, 210, 218);
      card.frame.lineStyle(1, selected ? 0x9b682d : 0x46545f, 1);
      card.frame.strokeRect(-101, -122, 202, 210);
      const cornerColor = selected ? 0xffd77c : 0x9cabb6;
      card.frame.fillStyle(cornerColor, 1);
      for (const [cornerX, cornerY] of [[-105, -126], [99, -126], [-105, 84], [99, 84]]) {
        card.frame.fillRect(cornerX, cornerY, 6, 6);
      }
      card.nameplate.setFillStyle(selected ? 0xd6c797 : 0x9da3a1, 1);
      card.nameplate.setStrokeStyle(2, selected ? 0xffc75d : 0x74828d, 1);
      card.name.setColor('#241b16');
      card.tagline.setColor(selected ? '#f2ddad' : '#9ea4a4');
      card.badge.setVisible(selected);
    });

    this.difficultyOptions.forEach((option, index) => {
      const selected = index === this.difficultyIndex;
      option
        .setText(selected ? `[${DIFFICULTIES[index].toUpperCase()}]` : DIFFICULTIES[index].toUpperCase())
        .setColor(selected ? '#ffb000' : '#776b71');
    });
  }

  private startFight(): void {
    applyFightSelection(
      gameSession,
      characterList[this.selectedIndex].id,
      DIFFICULTIES[this.difficultyIndex],
    );
    this.cameras.main.flash(70, 255, 210, 80);
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.time.delayedCall(180, () => this.scene.start('FightScene'));
  }
}

