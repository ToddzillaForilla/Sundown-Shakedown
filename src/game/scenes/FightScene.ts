import Phaser from 'phaser';
import { characterList, characters, type CharacterDefinition, type CharacterId, type MoveDefinition } from '../../content/characters';
import { backyard } from '../../content/stages/backyard';
import { OpponentAi } from '../../engine/ai/OpponentAi';
import { FIGHTER_GROUND_Y, Fighter } from '../../engine/combat/Fighter';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { TouchControls } from '../input/TouchControls';
import { gameSession } from '../session';
import { createButton } from '../ui/button';

type ControlAction = 'left' | 'right' | 'up' | 'down' | 'light' | 'heavy' | 'super';

export class FightScene extends Phaser.Scene {
  private player!: Fighter;
  private opponent!: Fighter;
  private opponentAi!: OpponentAi;
  private touch!: TouchControls;
  private keys!: Record<ControlAction, Phaser.Input.Keyboard.Key[]>;
  private mousePressed = { light: false, heavy: false, super: false };
  private playerHealthBar!: Phaser.GameObjects.Rectangle;
  private opponentHealthBar!: Phaser.GameObjects.Rectangle;
  private playerMeterBar!: Phaser.GameObjects.Rectangle;
  private opponentMeterBar!: Phaser.GameObjects.Rectangle;
  private timerText!: Phaser.GameObjects.Text;
  private announcement!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private playerWinMarkers!: Phaser.GameObjects.Arc[];
  private opponentWinMarkers!: Phaser.GameObjects.Arc[];
  private roundSeconds = 60;
  private lastSecondAt = 0;
  private playerWins = 0;
  private opponentWins = 0;
  private roundNumber = 1;
  private roundActive = false;
  private audioContext?: AudioContext;
  private comboAttacker?: CharacterId;
  private comboCount = 0;
  private comboExpiresAt = 0;

  constructor() {
    super('FightScene');
  }

  preload(): void {
    if (!this.textures.exists(backyard.background.textureKey)) {
      this.load.image(backyard.background.textureKey, backyard.background.url);
    }
    for (const character of characterList) {
      if (!this.textures.exists(character.art.fighterTextureKey)) {
        this.load.image(character.art.fighterTextureKey, character.art.fighterUrl);
      }
    }
  }

  create(): void {
    this.drawBackyard();

    const playerDefinition = characters[gameSession.playerCharacter];
    const opponentDefinition = gameSession.playerCharacter === 'todd' ? characters.kristen : characters.todd;
    this.player = new Fighter(this, playerDefinition, 260, 1);
    this.opponent = new Fighter(this, opponentDefinition, 700, -1);
    this.opponentAi = new OpponentAi(gameSession.difficulty);

    this.createHud(playerDefinition, opponentDefinition);
    this.createKeyboardControls();
    this.createMouseControls();
    this.touch = new TouchControls(this);
    this.startRound();
  }

  update(time: number, delta: number): void {
    const deltaSeconds = Math.min(delta / 1000, 0.04);
    this.player.updatePhysics(deltaSeconds);
    this.opponent.updatePhysics(deltaSeconds);
    this.player.updatePresentation(time);
    this.opponent.updatePresentation(time);
    this.updateFacing();

    if (!this.roundActive) {
      this.updateHud();
      return;
    }

    this.updatePlayer(time, deltaSeconds);
    this.updateOpponent(time, deltaSeconds);
    this.separateFighters();
    this.updateTimer(time);
    this.updateComboDisplay(time);
    this.updateHud();

    if (this.player.health <= 0 || this.opponent.health <= 0 || this.roundSeconds <= 0) {
      this.endRound();
    }
  }

  private drawBackyard(): void {
    if (this.textures.exists(backyard.background.textureKey)) {
      this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, backyard.background.textureKey)
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      this.add.rectangle(GAME_WIDTH / 2, 457, GAME_WIDTH, 166, 0x07150d, 0.12);
      this.add.text(18, 16, backyard.displayName.toUpperCase(), {
        color: '#f3d4b0',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        letterSpacing: 2,
      });
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillGradientStyle(backyard.skyTop, backyard.skyTop, backyard.skyBottom, backyard.skyBottom, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fillStyle(0x293653, 0.85);
    graphics.fillTriangle(20, 250, 190, 110, 360, 250);
    graphics.fillTriangle(260, 250, 510, 65, 760, 250);
    graphics.fillTriangle(620, 250, 835, 125, 980, 250);
    graphics.fillStyle(0x3a713e, 1);
    graphics.fillRect(0, 330, GAME_WIDTH, 210);
    graphics.fillStyle(backyard.fence, 1);
    graphics.fillRect(0, 272, GAME_WIDTH, 72);
    for (let x = 0; x < GAME_WIDTH; x += 56) {
      graphics.lineStyle(3, 0x7e5535, 0.65);
      graphics.lineBetween(x, 272, x, 344);
    }
    graphics.fillStyle(0x3b2925, 1);
    graphics.fillRect(50, 318, 104, 65);
    graphics.fillStyle(0x222222, 1);
    graphics.fillCircle(102, 315, 38);
    graphics.fillStyle(0xf69a39, 0.9);
    graphics.fillCircle(102, 307, 19);
    graphics.fillStyle(0x476d3c, 1);
    graphics.fillCircle(850, 315, 58);
    graphics.fillCircle(900, 325, 42);

    this.add.text(18, 16, backyard.displayName.toUpperCase(), {
      color: '#f3d4b0',
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      letterSpacing: 2,
    });
  }

  private createHud(playerDefinition: CharacterDefinition, opponentDefinition: CharacterDefinition): void {
    this.add.rectangle(230, 58, 370, 30, 0x180f25, 0.9).setStrokeStyle(3, 0xffd477);
    this.add.rectangle(730, 58, 370, 30, 0x180f25, 0.9).setStrokeStyle(3, 0xffd477);
    this.playerHealthBar = this.add.rectangle(48, 58, 360, 20, 0x57c46b).setOrigin(0, 0.5);
    this.opponentHealthBar = this.add.rectangle(912, 58, 360, 20, 0xe15d68).setOrigin(1, 0.5);
    this.playerMeterBar = this.add.rectangle(48, 85, 0, 8, playerDefinition.palette.accent).setOrigin(0, 0.5);
    this.opponentMeterBar = this.add.rectangle(912, 85, 0, 8, opponentDefinition.palette.accent).setOrigin(1, 0.5);

    this.add.text(48, 25, playerDefinition.displayName.toUpperCase(), {
      color: '#fff8df', fontFamily: 'Impact, sans-serif', fontSize: '23px',
    });
    this.add.text(912, 25, opponentDefinition.displayName.toUpperCase(), {
      color: '#fff8df', fontFamily: 'Impact, sans-serif', fontSize: '23px',
    }).setOrigin(1, 0);

    this.timerText = this.add.text(GAME_WIDTH / 2, 49, '60', {
      color: '#ffd36a', fontFamily: 'Impact, sans-serif', fontSize: '42px', stroke: '#311836', strokeThickness: 5,
    }).setOrigin(0.5);
    this.announcement = this.add.text(GAME_WIDTH / 2, 170, '', {
      align: 'center', color: '#fff8df', fontFamily: 'Impact, sans-serif', fontSize: '54px', stroke: '#5d203d', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(200);
    this.comboText = this.add.text(GAME_WIDTH / 2, 125, '', {
      color: '#fff1a8',
      fontFamily: 'Impact, sans-serif',
      fontSize: '28px',
      stroke: '#321a37',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(180).setVisible(false);

    this.playerWinMarkers = [0, 1].map((index) => this.add
      .circle(58 + index * 22, 105, 7, 0x20162f, 0.7)
      .setStrokeStyle(2, 0xffd477, 0.8));
    this.opponentWinMarkers = [0, 1].map((index) => this.add
      .circle(902 - index * 22, 105, 7, 0x20162f, 0.7)
      .setStrokeStyle(2, 0xffd477, 0.8));
  }

  private createKeyboardControls(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable');
    this.keys = {
      left: [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A].map((code) => keyboard.addKey(code)),
      right: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D].map((code) => keyboard.addKey(code)),
      up: [Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.W].map((code) => keyboard.addKey(code)),
      down: [Phaser.Input.Keyboard.KeyCodes.DOWN, Phaser.Input.Keyboard.KeyCodes.S].map((code) => keyboard.addKey(code)),
      light: [Phaser.Input.Keyboard.KeyCodes.J, Phaser.Input.Keyboard.KeyCodes.Z].map((code) => keyboard.addKey(code)),
      heavy: [Phaser.Input.Keyboard.KeyCodes.K, Phaser.Input.Keyboard.KeyCodes.X].map((code) => keyboard.addKey(code)),
      super: [Phaser.Input.Keyboard.KeyCodes.L, Phaser.Input.Keyboard.KeyCodes.C, Phaser.Input.Keyboard.KeyCodes.SPACE].map((code) => keyboard.addKey(code)),
    };
  }

  private createMouseControls(): void {
    this.input.mouse?.disableContextMenu();
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      if (pointer.wasTouch) return;
      if (pointer.x < 270 && pointer.y > 350) return;
      if (pointer.button === 0) this.mousePressed.light = true;
      if (pointer.button === 2) this.mousePressed.heavy = true;
      if (pointer.button === 1) this.mousePressed.super = true;
    });
  }

  private isKeyHeld(action: ControlAction): boolean {
    return this.keys[action].some((key) => key.isDown);
  }

  private consumeKeyPress(action: ControlAction): boolean {
    return this.keys[action].some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  private consumeMousePress(action: 'light' | 'heavy' | 'super'): boolean {
    const pressed = this.mousePressed[action];
    this.mousePressed[action] = false;
    return pressed;
  }

  private updatePlayer(time: number, deltaSeconds: number): void {
    const left = this.isKeyHeld('left') || this.touch.isHeld('left');
    const right = this.isKeyHeld('right') || this.touch.isHeld('right');
    const down = this.isKeyHeld('down') || this.touch.isHeld('down');
    const movement: -1 | 0 | 1 = left === right ? 0 : left ? -1 : 1;
    const away = this.opponent.x > this.player.x ? -1 : 1;
    const crouching = down && this.player.isGrounded;
    this.player.setCrouching(crouching);
    this.player.setBlocking(movement === away && this.player.isGrounded);
    if (!crouching && this.player.canAct(time)) this.player.move(movement, deltaSeconds);

    const jumpPressed = this.consumeKeyPress('up') || this.touch.consumePress('up');
    if (jumpPressed && this.player.canAct(time)) this.player.jump();

    const lightPressed = this.consumeKeyPress('light') || this.consumeMousePress('light') || this.touch.consumePress('light');
    const heavyPressed = this.consumeKeyPress('heavy') || this.consumeMousePress('heavy') || this.touch.consumePress('heavy');
    const superPressed = this.consumeKeyPress('super') || this.consumeMousePress('super') || this.touch.consumePress('super');

    if (superPressed && this.player.meter >= 100) {
      this.tryAttack(this.player, this.opponent, this.player.definition.moves.super, time);
      this.player.spendSuper();
    } else if (heavyPressed) {
      const move = down && movement === this.player.facing
        ? this.player.definition.moves.special
        : this.player.definition.moves.heavy;
      this.tryAttack(this.player, this.opponent, move, time);
    } else if (lightPressed) {
      this.tryAttack(this.player, this.opponent, this.player.definition.moves.light, time);
    }
  }

  private updateOpponent(time: number, deltaSeconds: number): void {
    const intent = this.opponentAi.update(time, this.opponent, this.player);
    this.opponent.setBlocking(intent.block);
    this.opponent.setCrouching(false);
    if (!intent.block && this.opponent.canAct(time)) this.opponent.move(intent.move, deltaSeconds);
    if (intent.jump && this.opponent.canAct(time)) this.opponent.jump();
    if (intent.attack) {
      const isSuper = intent.attack.kind === 'super';
      this.tryAttack(this.opponent, this.player, intent.attack, time);
      if (isSuper) this.opponent.spendSuper();
      intent.attack = undefined;
    }
  }

  private tryAttack(attacker: Fighter, defender: Fighter, move: MoveDefinition, time: number): void {
    if (!attacker.canAct(time)) return;
    attacker.attack(move, time);
    this.showAttackEffect(attacker, move);
    const distance = Math.abs(attacker.x - defender.x);
    const defenderInFront = Math.sign(defender.x - attacker.x) === attacker.facing;
    const hit = distance <= move.range && defenderInFront;
    this.playAttackTone(attacker.definition.id, move, hit);
    if (hit) {
      defender.takeHit(move, defender.blocking);
      attacker.gainMeter(move.meterGain);
      this.showHitBurst(defender, move, defender.blocking);
      if (!defender.blocking) this.registerComboHit(attacker, time);
      this.cameras.main.shake(move.kind === 'heavy' ? 70 : move.kind === 'super' ? 150 : 35, move.kind === 'super' ? 0.012 : 0.004);
      if (move.kind === 'super') {
        this.announcement.setText(move.name.toUpperCase()).setVisible(true);
        this.time.delayedCall(600, () => this.announcement.setVisible(false));
      }
    }
  }

  private registerComboHit(attacker: Fighter, time: number): void {
    if (this.comboAttacker === attacker.definition.id && time <= this.comboExpiresAt) {
      this.comboCount += 1;
    } else {
      this.comboAttacker = attacker.definition.id;
      this.comboCount = 1;
    }
    this.comboExpiresAt = time + 850;

    if (this.comboCount >= 2) {
      this.comboText
        .setPosition(attacker === this.player ? 250 : 710, 132)
        .setText(`${this.comboCount} HIT COMBO`)
        .setVisible(true)
        .setScale(1.18);
      this.tweens.add({
        targets: this.comboText,
        scale: 1,
        duration: 120,
        ease: 'Back.Out',
      });
    }
  }

  private updateComboDisplay(time: number): void {
    if (time <= this.comboExpiresAt) return;
    this.comboCount = 0;
    this.comboAttacker = undefined;
    this.comboText.setVisible(false);
  }

  private showAttackEffect(attacker: Fighter, move: MoveDefinition): void {
    const direction = attacker.facing;
    const isTodd = attacker.definition.id === 'todd';
    const color = isTodd ? 0x55dfff : 0x75d55d;

    if (move.kind === 'special' || move.kind === 'super') {
      const pieces = move.kind === 'super' ? 10 : 6;
      for (let index = 0; index < pieces; index += 1) {
        const offset = index * 10;
        const particle = isTodd
          ? this.add.rectangle(
            attacker.x + direction * (35 + offset),
            attacker.y - 80 - (index % 3) * 24,
            8 + (index % 2) * 7,
            8 + ((index + 1) % 2) * 7,
            color,
            0.9,
          )
          : this.add.circle(
            attacker.x + direction * (35 + offset),
            attacker.y - 95 - Math.sin(index) * 28,
            5 + (index % 3),
            color,
            0.9,
          );
        particle.setDepth(50).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: particle,
          x: particle.x + direction * (move.kind === 'super' ? 130 : 85),
          y: particle.y - 8 - (index % 2) * 12,
          alpha: 0,
          scale: move.kind === 'super' ? 2.1 : 1.5,
          duration: move.kind === 'super' ? 380 : 250,
          ease: 'Power2',
          onComplete: () => particle.destroy(),
        });
      }

      if (move.kind === 'super') {
        this.cameras.main.flash(160, isTodd ? 70 : 120, isTodd ? 190 : 205, isTodd ? 255 : 90, false);
      }
      return;
    }

    const swipe = this.add
      .rectangle(attacker.x + direction * 58, attacker.y - 112, move.kind === 'heavy' ? 58 : 34, 7, color, 0.85)
      .setAngle(direction * -18)
      .setDepth(50)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: swipe,
      x: swipe.x + direction * 28,
      alpha: 0,
      scaleX: 1.7,
      duration: move.kind === 'heavy' ? 180 : 110,
      onComplete: () => swipe.destroy(),
    });
  }

  private showHitBurst(defender: Fighter, move: MoveDefinition, blocked: boolean): void {
    const color = blocked ? 0xbfe8ff : move.kind === 'super' ? 0xffd45d : 0xff735f;
    const amount = blocked ? 4 : move.kind === 'super' ? 14 : move.kind === 'heavy' ? 9 : 6;
    for (let index = 0; index < amount; index += 1) {
      const angle = (Math.PI * 2 * index) / amount;
      const distance = move.kind === 'super' ? 72 : 44;
      const particle = this.add
        .rectangle(defender.x, defender.y - 120, 5 + (index % 3) * 2, 5 + ((index + 1) % 3) * 2, color, 1)
        .setDepth(60)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: particle,
        x: defender.x + Math.cos(angle) * distance,
        y: defender.y - 120 + Math.sin(angle) * distance,
        alpha: 0,
        duration: move.kind === 'super' ? 360 : 220,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private playAttackTone(characterId: 'todd' | 'kristen', move: MoveDefinition, hit: boolean): void {
    try {
      this.audioContext ??= new AudioContext();
      if (this.audioContext.state === 'suspended') void this.audioContext.resume();

      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const now = this.audioContext.currentTime;
      const baseFrequency = move.kind === 'light' ? 220 : move.kind === 'heavy' ? 150 : move.kind === 'special' ? 105 : 72;
      oscillator.type = characterId === 'todd' ? 'square' : 'sawtooth';
      oscillator.frequency.setValueAtTime(baseFrequency * (hit ? 1 : 1.35), now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, baseFrequency * 0.48), now + 0.08);
      gain.gain.setValueAtTime(hit ? 0.045 : 0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (move.kind === 'super' ? 0.2 : 0.09));
      oscillator.connect(gain).connect(this.audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + (move.kind === 'super' ? 0.21 : 0.1));
    } catch {
      // Audio is optional; browsers can deny sound until the next user gesture.
    }
  }

  private updateFacing(): void {
    this.player.setFacing(this.opponent.x >= this.player.x ? 1 : -1);
    this.opponent.setFacing(this.player.x >= this.opponent.x ? 1 : -1);
  }

  private separateFighters(): void {
    const playerCanCross = !this.player.isGrounded && this.player.y <= FIGHTER_GROUND_Y - 44;
    const opponentCanCross = !this.opponent.isGrounded && this.opponent.y <= FIGHTER_GROUND_Y - 44;
    if (playerCanCross || opponentCanCross) return;

    const minimumDistance = 78;
    const distance = Math.abs(this.player.x - this.opponent.x);
    if (distance >= minimumDistance) return;
    const push = (minimumDistance - distance) / 2;
    const direction = this.player.x < this.opponent.x ? -1 : 1;
    this.player.view.x = Phaser.Math.Clamp(this.player.x + direction * push, 72, 888);
    this.opponent.view.x = Phaser.Math.Clamp(this.opponent.x - direction * push, 72, 888);
  }

  private updateTimer(time: number): void {
    if (time - this.lastSecondAt < 1000) return;
    this.lastSecondAt = time;
    this.roundSeconds = Math.max(0, this.roundSeconds - 1);
  }

  private updateHud(): void {
    this.playerHealthBar.displayWidth = 360 * (this.player.health / this.player.definition.stats.maxHealth);
    this.opponentHealthBar.displayWidth = 360 * (this.opponent.health / this.opponent.definition.stats.maxHealth);
    this.playerMeterBar.displayWidth = 360 * (this.player.meter / 100);
    this.opponentMeterBar.displayWidth = 360 * (this.opponent.meter / 100);
    this.timerText.setText(String(this.roundSeconds));
    this.touch.setSuperAvailable(this.player.meter >= 100 && this.roundActive);
  }

  private startRound(): void {
    this.roundActive = false;
    this.player.reset(260, 1);
    this.opponent.reset(700, -1);
    this.roundSeconds = 60;
    this.comboCount = 0;
    this.comboAttacker = undefined;
    this.comboExpiresAt = 0;
    this.comboText.setVisible(false);
    this.lastSecondAt = this.time.now;
    this.announcement.setText(`ROUND ${this.roundNumber}`);
    this.time.delayedCall(850, () => this.announcement.setText('FIGHT!'));
    this.time.delayedCall(1450, () => {
      this.announcement.setVisible(false);
      this.roundActive = true;
      this.lastSecondAt = this.time.now;
    });
  }

  private endRound(): void {
    if (!this.roundActive) return;
    this.roundActive = false;
    const playerWon = this.player.health > this.opponent.health;
    if (playerWon) this.playerWins += 1;
    else this.opponentWins += 1;
    if (playerWon) this.playerWinMarkers[this.playerWins - 1]?.setFillStyle(0xffd45d, 1);
    else this.opponentWinMarkers[this.opponentWins - 1]?.setFillStyle(0xffd45d, 1);

    const winner = playerWon ? this.player.definition.displayName : this.opponent.definition.displayName;
    this.announcement.setVisible(true).setText(`${winner.toUpperCase()} WINS`);
    const matchOver = this.playerWins >= 2 || this.opponentWins >= 2;
    if (matchOver) {
      this.time.delayedCall(900, () => this.showMatchResult(winner));
      return;
    }
    this.roundNumber += 1;
    this.time.delayedCall(1600, () => this.startRound());
  }

  private showMatchResult(winner: string): void {
    this.announcement.setText(`${winner.toUpperCase()}\nSHAKES DOWN THE BACKYARD`);
    createButton(this, GAME_WIDTH / 2 - 125, 330, 'REMATCH', () => this.scene.restart(), { width: 210 });
    createButton(this, GAME_WIDTH / 2 + 125, 330, 'CHARACTERS', () => this.scene.start('CharacterSelectScene'), { width: 210 });
  }
}

