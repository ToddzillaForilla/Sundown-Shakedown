import Phaser from 'phaser';
import { characterList, type CharacterDefinition } from '../../content/characters';
import type { Difficulty } from '../session';
import { applyFightSelection, gameSession } from '../session';
import { GAME_WIDTH } from '../config';
import { createButton } from '../ui/button';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private difficultyIndex = 1;
  private selectionText?: Phaser.GameObjects.Text;
  private difficultyText?: Phaser.GameObjects.Text;
  private portrait?: Phaser.GameObjects.Container;

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
    this.cameras.main.setBackgroundColor('#1a1229');
    this.add
      .text(GAME_WIDTH / 2, 48, 'CHOOSE YOUR FIGHTER', {
        color: '#ffd36a',
        fontFamily: 'Impact, sans-serif',
        fontSize: '45px',
        stroke: '#6e223e',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    createButton(this, 170, 250, '◀', () => this.changeCharacter(-1), {
      width: 80,
      height: 80,
      fontSize: 38,
    });
    createButton(this, 790, 250, '▶', () => this.changeCharacter(1), {
      width: 80,
      height: 80,
      fontSize: 38,
    });

    this.selectionText = this.add.text(GAME_WIDTH / 2, 375, '', {
      align: 'center',
      color: '#fff8df',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '24px',
    }).setOrigin(0.5);

    this.difficultyText = this.add.text(GAME_WIDTH / 2, 430, '', {
      color: '#d9c6df',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.difficultyText.on('pointerup', () => this.changeDifficulty());

    createButton(this, GAME_WIDTH / 2, 492, 'FIGHT', () => this.startFight(), {
      width: 220,
      height: 58,
    });

    this.input.keyboard?.on('keydown-LEFT', () => this.changeCharacter(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changeCharacter(1));
    this.input.keyboard?.on('keydown-UP', () => this.changeDifficulty(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.changeDifficulty(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.startFight());

    this.renderSelection();
  }

  private changeCharacter(direction: number): void {
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, characterList.length);
    this.renderSelection();
  }

  private changeDifficulty(direction = 1): void {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
    this.difficultyIndex = Phaser.Math.Wrap(this.difficultyIndex + direction, 0, difficulties.length);
    this.renderSelection();
  }

  private renderSelection(): void {
    const character = characterList[this.selectedIndex];
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
    this.portrait?.destroy(true);
    this.portrait = this.createPortrait(character);
    this.selectionText?.setText(`${character.displayName.toUpperCase()}\n${character.tagline}`);
    this.difficultyText?.setText(`DIFFICULTY: ${difficulties[this.difficultyIndex].toUpperCase()}  •  TAP TO CHANGE`);
  }

  private createPortrait(character: CharacterDefinition): Phaser.GameObjects.Container {
    const container = this.add.container(GAME_WIDTH / 2, 226);
    const glow = this.add.circle(0, 0, 128, character.palette.accent, 0.13);
    const frame = this.add.rectangle(0, 0, 244, 244, 0x120d1e, 0.35)
      .setStrokeStyle(4, character.palette.accent, 0.8);
    const portrait = this.add
      .image(0, 0, character.art.portraitTextureKey)
      .setDisplaySize(230, 230);
    container.add([glow, frame, portrait]);
    return container;
  }

  private startFight(): void {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
    applyFightSelection(
      gameSession,
      characterList[this.selectedIndex].id,
      difficulties[this.difficultyIndex],
    );
    this.scene.start('FightScene');
  }
}

