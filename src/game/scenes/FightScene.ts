import Phaser from 'phaser';
import { characterList, characters, type CharacterDefinition, type CharacterId, type MoveDefinition } from '../../content/characters';
import { backyard } from '../../content/stages/backyard';
import { OpponentAi, getAiDifficultyProfile } from '../../engine/ai/OpponentAi';
import { canUseSuper, isHitInRange, resolvePlayerMoveSlot } from '../../engine/combat/CombatAttacks';
import { canGuardMove, resolveGuardStance } from '../../engine/combat/CombatBlocking';
import {
  canFightersCross,
  faceTowardOpponent,
  separateFighterPositions,
} from '../../engine/combat/CombatMovement';
import { FIGHTER_GROUND_Y, Fighter } from '../../engine/combat/Fighter';
import {
  completeRoundOnce,
  createRoundEndLatch,
  createMatchState,
  resetRoundClock,
  resetRoundEndLatch,
  tickRoundClock,
} from '../../engine/combat/MatchState';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { PlayerInputBuffer, resolveDirectionalIntent, type BufferedAction } from '../input/PlayerInput';
import { shouldShowTouchControls, TouchControls } from '../input/TouchControls';
import { gameSession } from '../session';

type ControlAction = 'left' | 'right' | 'up' | 'down' | 'kick' | 'punch' | 'jump' | 'super';
const PIXEL_FONT = '"Courier New", Courier, monospace';
const SUPER_METER_WIDTH = 180;

export class FightScene extends Phaser.Scene {
  private player!: Fighter;
  private opponent!: Fighter;
  private opponentAi!: OpponentAi;
  private touch?: TouchControls;
  private keys!: Record<ControlAction, Phaser.Input.Keyboard.Key[]>;
  private mousePressed = { kick: false, punch: false, super: false };
  private inputBuffer = new PlayerInputBuffer();
  private playerHealthBar!: Phaser.GameObjects.Rectangle;
  private opponentHealthBar!: Phaser.GameObjects.Rectangle;
  private playerMeterFrame!: Phaser.GameObjects.Rectangle;
  private opponentMeterFrame!: Phaser.GameObjects.Rectangle;
  private playerMeterBar!: Phaser.GameObjects.Rectangle;
  private opponentMeterBar!: Phaser.GameObjects.Rectangle;
  private playerMeterLabel!: Phaser.GameObjects.Text;
  private opponentMeterLabel!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private announcement!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private playerWinMarkers!: Phaser.GameObjects.Arc[];
  private opponentWinMarkers!: Phaser.GameObjects.Arc[];
  private topHudElements: Array<
    Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text | Phaser.GameObjects.Arc
  > = [];
  private match = createMatchState();
  private roundEndLatch = createRoundEndLatch();
  private lastSecondAt = 0;
  private roundActive = false;
  private audioContext?: AudioContext;
  private comboAttacker?: CharacterId;
  private comboCount = 0;
  private comboExpiresAt = 0;
  private playerGuardReady = false;
  private opponentGuardReady = false;

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
      if (character.art.idleSheet && !this.textures.exists(character.art.idleSheet.textureKey)) {
        this.load.spritesheet(character.art.idleSheet.textureKey, character.art.idleSheet.url, {
          frameWidth: character.art.idleSheet.frameWidth,
          frameHeight: character.art.idleSheet.frameHeight,
          endFrame: character.art.idleSheet.frameCount - 1,
        });
      }
      const queuedWalkTextureKeys = new Set<string>();
      for (const walkSheet of [character.art.walkSheet, character.art.walkLeftSheet]) {
        if (!walkSheet || this.textures.exists(walkSheet.textureKey) || queuedWalkTextureKeys.has(walkSheet.textureKey)) continue;
        queuedWalkTextureKeys.add(walkSheet.textureKey);
        this.load.spritesheet(walkSheet.textureKey, walkSheet.url, {
          frameWidth: walkSheet.frameWidth,
          frameHeight: walkSheet.frameHeight,
          endFrame: walkSheet.frameCount - 1,
        });
      }
      for (const sheet of [
        character.art.jumpSheet,
        character.art.landingSheet,
        character.art.crouchSheet,
        character.art.blockSheet,
        character.art.kickAttackSheet,
        character.art.punchAttackSheet,
        character.art.alternatePunchAttackSheet,
        character.art.airKickAttackSheet,
        character.art.airPunchAttackSheet,
        character.art.hitSheet,
        character.art.defeatSheet,
      ]) {
        if (!sheet || this.textures.exists(sheet.textureKey)) continue;
        this.load.spritesheet(sheet.textureKey, sheet.url, {
          frameWidth: sheet.frameWidth,
          frameHeight: sheet.frameHeight,
          endFrame: sheet.frameCount - 1,
        });
      }
      const reactionSheet = character.art.reactionSheet;
      if (reactionSheet && !this.textures.exists(reactionSheet.textureKey)) {
        this.load.spritesheet(reactionSheet.textureKey, reactionSheet.url, {
          frameWidth: reactionSheet.frameWidth,
          frameHeight: reactionSheet.frameHeight,
          endFrame: reactionSheet.frameCount - 1,
        });
      }
    }
  }

  create(): void {
    this.match = createMatchState();
    this.roundEndLatch = createRoundEndLatch();
    this.roundActive = false;
    this.lastSecondAt = 0;
    this.mousePressed = { kick: false, punch: false, super: false };
    this.inputBuffer = new PlayerInputBuffer();
    this.comboAttacker = undefined;
    this.comboCount = 0;
    this.comboExpiresAt = 0;
    this.playerGuardReady = false;
    this.opponentGuardReady = false;
    this.topHudElements = [];
    this.drawBackyard();

    const playerDefinition = characters[gameSession.playerCharacter];
    const opponentDefinition = gameSession.playerCharacter === 'todd' ? characters.kristen : characters.todd;
    this.player = new Fighter(this, playerDefinition, 260, 1);
    this.opponent = new Fighter(this, opponentDefinition, 700, -1);
    this.opponentAi = new OpponentAi(gameSession.difficulty);

    this.createHud(playerDefinition, opponentDefinition);
    this.createKeyboardControls();
    this.createMouseControls();
    this.touch = shouldShowTouchControls() ? new TouchControls(this) : undefined;
    this.showControlGuide();
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
    this.updateFacing();
    this.updateTimer(time);
    this.updateComboDisplay(time);
    this.updateHud();

    if (this.player.health <= 0 || this.opponent.health <= 0 || this.match.roundSeconds <= 0) {
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
    const playerHealthFrame = this.add.rectangle(230, 58, 370, 30, 0x180f25, 0.9).setStrokeStyle(3, 0xffd477);
    const opponentHealthFrame = this.add.rectangle(730, 58, 370, 30, 0x180f25, 0.9).setStrokeStyle(3, 0xffd477);
    this.playerHealthBar = this.add.rectangle(48, 58, 360, 20, 0x57c46b).setOrigin(0, 0.5);
    this.opponentHealthBar = this.add.rectangle(912, 58, 360, 20, 0xe15d68).setOrigin(1, 0.5);
    this.playerMeterFrame = this.add.rectangle(138, 85, 185, 14, 0x0b0810, 0.9).setStrokeStyle(2, 0x7a6c84, 0.75);
    this.opponentMeterFrame = this.add.rectangle(822, 85, 185, 14, 0x0b0810, 0.9).setStrokeStyle(2, 0x7a6c84, 0.75);
    this.playerMeterBar = this.add.rectangle(48, 85, SUPER_METER_WIDTH, 8, playerDefinition.palette.accent).setOrigin(0, 0.5);
    this.opponentMeterBar = this.add.rectangle(912, 85, SUPER_METER_WIDTH, 8, opponentDefinition.palette.accent).setOrigin(1, 0.5);
    this.playerMeterBar.displayWidth = 0;
    this.opponentMeterBar.displayWidth = 0;
    this.playerMeterLabel = this.add.text(54, 85, 'SUPER', {
      color: '#d7cfdf', fontFamily: PIXEL_FONT, fontSize: '9px', fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(0, 0.5);
    this.opponentMeterLabel = this.add.text(906, 85, 'SUPER', {
      color: '#d7cfdf', fontFamily: PIXEL_FONT, fontSize: '9px', fontStyle: 'bold', letterSpacing: 1,
    }).setOrigin(1, 0.5);

    const playerName = this.add.text(48, 25, playerDefinition.displayName.toUpperCase(), {
      color: '#fff8df', fontFamily: 'Impact, sans-serif', fontSize: '23px',
    });
    const opponentName = this.add.text(912, 25, opponentDefinition.displayName.toUpperCase(), {
      color: '#fff8df', fontFamily: 'Impact, sans-serif', fontSize: '23px',
    }).setOrigin(1, 0);

    this.timerText = this.add.text(GAME_WIDTH / 2, 49, '60', {
      color: '#ffd36a', fontFamily: 'Impact, sans-serif', fontSize: '42px', stroke: '#311836', strokeThickness: 5,
    }).setOrigin(0.5);
    this.announcement = this.add.text(GAME_WIDTH / 2, 170, '', {
      align: 'center',
      color: '#ffb000',
      fontFamily: 'Impact, Haettenschweiler, sans-serif',
      fontSize: '54px',
      fontStyle: 'italic',
      letterSpacing: 2,
      stroke: '#b20f1e',
      strokeThickness: 8,
      shadow: { offsetX: 6, offsetY: 7, color: '#230005', blur: 0, stroke: true, fill: true },
    }).setPadding(24, 12, 40, 20).setOrigin(0.5).setDepth(200);
    this.comboText = this.add.text(GAME_WIDTH / 2, 125, '', {
      color: '#ffb000',
      fontFamily: PIXEL_FONT,
      fontSize: '23px',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#b20f1e',
      strokeThickness: 4,
    }).setPadding(12, 6, 16, 8).setOrigin(0.5).setDepth(180).setVisible(false);

    this.playerWinMarkers = [0, 1].map((index) => this.add
      .circle(58 + index * 22, 105, 7, 0x20162f, 0.7)
      .setStrokeStyle(2, 0xffd477, 0.8));
    this.opponentWinMarkers = [0, 1].map((index) => this.add
      .circle(902 - index * 22, 105, 7, 0x20162f, 0.7)
      .setStrokeStyle(2, 0xffd477, 0.8));
    this.topHudElements = [
      playerHealthFrame,
      opponentHealthFrame,
      this.playerHealthBar,
      this.opponentHealthBar,
      this.playerMeterFrame,
      this.opponentMeterFrame,
      this.playerMeterBar,
      this.opponentMeterBar,
      this.playerMeterLabel,
      this.opponentMeterLabel,
      playerName,
      opponentName,
      this.timerText,
      ...this.playerWinMarkers,
      ...this.opponentWinMarkers,
    ];
  }

  private createKeyboardControls(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable');
    this.keys = {
      left: [Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.A].map((code) => keyboard.addKey(code)),
      right: [Phaser.Input.Keyboard.KeyCodes.RIGHT, Phaser.Input.Keyboard.KeyCodes.D].map((code) => keyboard.addKey(code)),
      up: [Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.W].map((code) => keyboard.addKey(code)),
      down: [Phaser.Input.Keyboard.KeyCodes.DOWN, Phaser.Input.Keyboard.KeyCodes.S].map((code) => keyboard.addKey(code)),
      kick: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)],
      punch: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)],
      jump: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)],
      super: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)],
    };
  }

  private createMouseControls(): void {
    this.input.mouse?.disableContextMenu();
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      if (pointer.wasTouch) return;
      if (pointer.x < 270 && pointer.y > 350) return;
      if (pointer.button === 0) this.mousePressed.kick = true;
      if (pointer.button === 2) this.mousePressed.punch = true;
      if (pointer.button === 1) this.mousePressed.super = true;
    });
  }

  private showControlGuide(): void {
    const guide = this.add.text(
      GAME_WIDTH / 2,
      505,
      'MOVE WASD  |  GUARD HOLD AWAY\nJUMP SPACE  |  PUNCH J  |  KICK K  |  SPECIAL L',
      {
      align: 'center',
      color: '#f4f0ff',
      backgroundColor: '#020102dd',
      fontFamily: PIXEL_FONT,
      fontSize: '10px',
      fontStyle: 'bold',
      letterSpacing: 1,
      padding: { x: 12, y: 6 },
      },
    ).setOrigin(0.5).setDepth(160);
    this.time.delayedCall(6000, () => {
      this.tweens.add({ targets: guide, alpha: 0, duration: 500, onComplete: () => guide.destroy() });
    });
  }

  private isKeyHeld(action: ControlAction): boolean {
    return this.keys[action].some((key) => key.isDown);
  }

  private consumeKeyPress(action: ControlAction): boolean {
    return this.keys[action].some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  private consumeMousePress(action: 'kick' | 'punch' | 'super'): boolean {
    const pressed = this.mousePressed[action];
    this.mousePressed[action] = false;
    return pressed;
  }

  private capturePressedInputs(time: number): void {
    const sources: Record<BufferedAction, boolean> = {
      jump: this.consumeKeyPress('jump') || (this.touch?.consumePress('jump') ?? false),
      kick: this.consumeKeyPress('kick') || this.consumeMousePress('kick') || (this.touch?.consumePress('kick') ?? false),
      punch: this.consumeKeyPress('punch') || this.consumeMousePress('punch') || (this.touch?.consumePress('punch') ?? false),
      super: this.consumeKeyPress('super') || this.consumeMousePress('super') || (this.touch?.consumePress('super') ?? false),
    };
    for (const [action, pressed] of Object.entries(sources) as Array<[BufferedAction, boolean]>) {
      if (pressed) this.inputBuffer.press(action, time);
    }
  }

  private updatePlayer(time: number, deltaSeconds: number): void {
    const left = this.isKeyHeld('left') || (this.touch?.isHeld('left') ?? false);
    const right = this.isKeyHeld('right') || (this.touch?.isHeld('right') ?? false);
    const down = this.isKeyHeld('down') || (this.touch?.isHeld('down') ?? false);
    const { movement, crouching, guardReady, blocking } = resolveDirectionalIntent(
      { left, right, down },
      this.opponent.x > this.player.x,
      this.player.isGrounded,
      this.opponent.presentationState === 'attack',
    );
    this.playerGuardReady = guardReady;
    this.player.setCrouching(crouching);
    this.player.setBlocking(blocking);
    if (!crouching && this.player.canAct(time)) this.player.move(movement, deltaSeconds);

    this.capturePressedInputs(time);
    if (blocking) return;
    if (!this.player.canAct(time)) return;

    const launchedThisFrame = this.player.isGrounded && this.inputBuffer.consume('jump', time);
    if (launchedThisFrame) this.player.jump();

    const attackPriority: BufferedAction[] = canUseSuper(this.player.meter)
      ? ['super', 'punch', 'kick']
      : ['punch', 'kick'];
    const attack = this.inputBuffer.consumeFirst(attackPriority, time);
    if (!attack || attack === 'jump') return;

    const moveSlot = resolvePlayerMoveSlot(attack, {
      grounded: this.player.isGrounded,
      launchedThisFrame,
      crouching,
      down,
      movement,
      facing: this.player.facing,
      meter: this.player.meter,
    });
    if (!moveSlot) return;

    const attackStarted = this.tryAttack(this.player, this.opponent, this.player.definition.moves[moveSlot], time);
    if (moveSlot === 'super' && attackStarted) this.player.spendSuper();
  }

  private updateOpponent(time: number, deltaSeconds: number): void {
    const intent = this.opponentAi.update(time, this.opponent, this.player);
    this.opponentGuardReady = intent.block && this.opponent.isGrounded;
    this.opponent.setBlocking(this.opponentGuardReady && this.player.presentationState === 'attack');
    this.opponent.setCrouching(false);
    if (!this.opponent.blocking && this.opponent.canAct(time)) this.opponent.move(intent.move, deltaSeconds);
    if (intent.jump && this.opponent.canAct(time)) this.opponent.jump();
    if (intent.attack) {
      const isSuper = intent.attack.kind === 'super';
      const attackStarted = this.tryAttack(this.opponent, this.player, intent.attack, time);
      if (isSuper && attackStarted) this.opponent.spendSuper();
    }
  }

  private tryAttack(attacker: Fighter, defender: Fighter, move: MoveDefinition, time: number): boolean {
    if (!attacker.canAct(time)) return false;
    attacker.attack(move, time);
    const guardReady = defender === this.player ? this.playerGuardReady : this.opponentGuardReady;
    defender.setBlocking(guardReady && defender.isGrounded);
    this.showAttackEffect(attacker, move);
    const hit = isHitInRange(attacker.x, defender.x, attacker.facing, move.range);
    this.playAttackTone(attacker.definition.id, move, hit);
    if (hit) {
      const guardStance = resolveGuardStance(defender.blocking, defender.isCrouching, defender.isGrounded);
      const blocked = canGuardMove(move, guardStance);
      const damageMultiplier = attacker === this.opponent
        ? getAiDifficultyProfile(gameSession.difficulty).damageMultiplier
        : 1;
      const damage = defender.takeHit(move, blocked, damageMultiplier);
      attacker.gainMeter(move.meterGain);
      this.showHitBurst(defender, move, blocked);
      this.showDamageNumber(defender, damage, blocked);
      if (!blocked) this.registerComboHit(attacker, time);
      this.cameras.main.shake(move.kind === 'heavy' ? 70 : move.kind === 'super' ? 150 : 35, move.kind === 'super' ? 0.012 : 0.004);
      if (move.kind === 'special' || move.kind === 'super') {
        this.showMoveName(attacker, move);
      }
    }
    return true;
  }

  private showMoveName(attacker: Fighter, move: MoveDefinition): void {
    if (move.kind === 'super') {
      this.showAnnouncement(move.name.toUpperCase());
      this.time.delayedCall(600, () => this.announcement.setVisible(false));
      return;
    }

    const labelX = Phaser.Math.Clamp(attacker.x, 120, GAME_WIDTH - 120);
    const label = this.add.text(labelX, attacker.y - 270, move.name.toUpperCase(), {
      color: attacker.definition.id === 'todd' ? '#87ecff' : '#a8ef86',
      fontFamily: PIXEL_FONT,
      fontSize: '15px',
      fontStyle: 'bold',
      letterSpacing: 1,
      stroke: '#180308',
      strokeThickness: 4,
    }).setPadding(10, 6, 16, 8).setOrigin(0.5).setDepth(170);
    this.tweens.add({
      targets: label,
      y: label.y - 24,
      alpha: 0,
      duration: 620,
      ease: 'Power2',
      onComplete: () => label.destroy(),
    });
  }

  private showDamageNumber(defender: Fighter, damage: number, blocked: boolean): void {
    const labelX = Phaser.Math.Clamp(defender.x, 90, GAME_WIDTH - 90);
    const label = this.add.text(labelX, defender.y - 205, blocked ? `[BLOCK] -${damage}` : `-${damage}`, {
      color: blocked ? '#f4f0ff' : '#ffb000',
      fontFamily: PIXEL_FONT,
      fontSize: blocked ? '13px' : '18px',
      fontStyle: 'bold',
      stroke: blocked ? '#5c1d75' : '#b20f1e',
      strokeThickness: 4,
    }).setPadding(10, 6, 14, 8).setOrigin(0.5).setDepth(170);
    this.tweens.add({
      targets: label,
      y: label.y - 34,
      alpha: 0,
      scale: blocked ? 0.92 : 1.18,
      duration: 520,
      ease: 'Power2',
      onComplete: () => label.destroy(),
    });
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
    const impactRing = this.add
      .circle(defender.x, defender.y - 120, blocked ? 24 : 15, color, blocked ? 0.04 : 0.16)
      .setStrokeStyle(blocked ? 4 : 3, color, 0.95)
      .setDepth(59)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: impactRing,
      alpha: 0,
      scale: blocked ? 1.45 : 1.85,
      duration: blocked ? 150 : 120,
      ease: 'Power2',
      onComplete: () => impactRing.destroy(),
    });
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
    this.player.setFacing(faceTowardOpponent(this.player.x, this.opponent.x, this.player.facing));
    this.opponent.setFacing(faceTowardOpponent(this.opponent.x, this.player.x, this.opponent.facing));
  }

  private separateFighters(): void {
    if (canFightersCross(
      { y: this.player.y, grounded: this.player.isGrounded },
      { y: this.opponent.y, grounded: this.opponent.isGrounded },
      FIGHTER_GROUND_Y,
    )) return;

    const positions = separateFighterPositions(this.player.x, this.opponent.x);
    this.player.view.x = positions.playerX;
    this.opponent.view.x = positions.opponentX;
  }

  private updateTimer(time: number): void {
    if (time - this.lastSecondAt < 1000) return;
    this.lastSecondAt = time;
    tickRoundClock(this.match);
  }

  private updateHud(): void {
    this.playerHealthBar.displayWidth = 360 * (this.player.health / this.player.definition.stats.maxHealth);
    this.opponentHealthBar.displayWidth = 360 * (this.opponent.health / this.opponent.definition.stats.maxHealth);
    this.playerMeterBar.displayWidth = SUPER_METER_WIDTH * (this.player.meter / 100);
    this.opponentMeterBar.displayWidth = SUPER_METER_WIDTH * (this.opponent.meter / 100);
    const playerSuperReady = canUseSuper(this.player.meter);
    const opponentSuperReady = canUseSuper(this.opponent.meter);
    this.playerMeterBar.setFillStyle(playerSuperReady ? 0xffd45d : this.player.definition.palette.accent);
    this.opponentMeterBar.setFillStyle(opponentSuperReady ? 0xffd45d : this.opponent.definition.palette.accent);
    this.playerMeterFrame.setStrokeStyle(2, playerSuperReady ? 0xffd45d : 0x7a6c84, playerSuperReady ? 1 : 0.75);
    this.opponentMeterFrame.setStrokeStyle(2, opponentSuperReady ? 0xffd45d : 0x7a6c84, opponentSuperReady ? 1 : 0.75);
    this.playerMeterLabel
      .setText(playerSuperReady ? 'SUPER READY' : 'SUPER')
      .setColor(playerSuperReady ? '#fff2a8' : '#d7cfdf');
    this.opponentMeterLabel
      .setText(opponentSuperReady ? 'SUPER READY' : 'SUPER')
      .setColor(opponentSuperReady ? '#fff2a8' : '#d7cfdf');
    this.timerText.setText(String(this.match.roundSeconds));
    const fighterInHud = this.player.y < 318 || this.opponent.y < 318;
    const hudAlpha = fighterInHud ? 0.38 : 1;
    for (const element of this.topHudElements) element.setAlpha(hudAlpha);
    this.touch?.setSuperAvailable(this.player.meter >= 100 && this.roundActive);
  }

  private startRound(): void {
    this.roundActive = false;
    this.inputBuffer.clear();
    this.opponentAi.reset();
    this.playerGuardReady = false;
    this.opponentGuardReady = false;
    this.player.reset(260, 1);
    this.opponent.reset(700, -1);
    resetRoundClock(this.match);
    resetRoundEndLatch(this.roundEndLatch);
    this.comboCount = 0;
    this.comboAttacker = undefined;
    this.comboExpiresAt = 0;
    this.comboText.setVisible(false);
    this.lastSecondAt = this.time.now;
    this.showAnnouncement(`ROUND ${this.match.roundNumber}`);
    this.time.delayedCall(850, () => this.showAnnouncement('FIGHT!'));
    this.time.delayedCall(1450, () => {
      this.announcement.setVisible(false);
      this.roundActive = true;
      this.lastSecondAt = this.time.now;
    });
  }

  private endRound(): void {
    if (!this.roundActive) return;
    this.roundActive = false;
    const result = completeRoundOnce(
      this.match,
      this.roundEndLatch,
      this.player.health,
      this.opponent.health,
    );
    if (!result) return;

    if (result.winner === 'player') {
      this.playerWinMarkers[result.playerWins - 1]?.setFillStyle(0xffd45d, 1);
    } else if (result.winner === 'opponent') {
      this.opponentWinMarkers[result.opponentWins - 1]?.setFillStyle(0xffd45d, 1);
    }

    const winner = result.winner === 'player'
      ? this.player.definition.displayName
      : this.opponent.definition.displayName;
    const announcement = result.winner === 'draw' ? 'DRAW' : `${winner.toUpperCase()} WINS`;
    this.showAnnouncement(announcement);
    if (result.matchOver) {
      this.time.delayedCall(900, () => this.showMatchResult(winner));
      return;
    }
    this.time.delayedCall(1600, () => this.startRound());
  }

  private showMatchResult(winner: string): void {
    this.announcement
      .setFontSize(34)
      .setLineSpacing(5);
    this.showAnnouncement(`${winner.toUpperCase()}\nSHAKES DOWN THE BACKYARD`);

    const buttonY = GAME_HEIGHT - 48;
    const buttonTop = buttonY - 27;
    const gap = 12;
    this.announcement.setPosition(
      GAME_WIDTH / 2,
      buttonTop - gap - this.announcement.height / 2,
    );
    this.createResultButton(GAME_WIDTH / 2 - 102, buttonY, 'REMATCH', () => this.scene.restart());
    this.createResultButton(GAME_WIDTH / 2 + 102, buttonY, 'CHARACTERS', () => this.scene.start('CharacterSelectScene'));
  }

  private showAnnouncement(message: string): void {
    this.tweens.killTweensOf(this.announcement);
    this.announcement
      .setText(message)
      .setVisible(true)
      .setAlpha(1)
      .setScale(0.78);
    this.tweens.add({
      targets: this.announcement,
      scale: 1,
      duration: 180,
      ease: 'Back.Out',
    });
  }

  private createResultButton(x: number, y: number, labelText: string, onPress: () => void): void {
    const background = this.add
      .rectangle(0, 0, 196, 54, 0x23060b, 0.98)
      .setStrokeStyle(3, 0xd31a16, 1)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(0, 0, labelText, {
        color: '#ffb000',
        fontFamily: PIXEL_FONT,
        fontSize: '18px',
        fontStyle: 'bold',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    const button = this.add.container(x, y, [background, label]).setDepth(210);

    background.on('pointerover', () => background.setFillStyle(0x4a0b13, 1));
    background.on('pointerout', () => background.setFillStyle(0x23060b, 0.98));
    background.on('pointerdown', () => button.setScale(0.97));
    background.on('pointerup', () => {
      button.setScale(1);
      onPress();
    });
  }
}

