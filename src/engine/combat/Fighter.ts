import Phaser from 'phaser';
import type { CharacterAnimationSheet, CharacterDefinition, MoveDefinition } from '../../content/characters';
import { getAttackPresentation, getAuthoredAttackAnimation, getHitStunMs, selectPunchAnimationSheet } from './CombatAttacks';
import { calculateHitDamage } from './CombatBlocking';
import { getCombatFlashProfile, type CombatFeedbackKind } from './CombatEffects';
import { getReactionNativeFacing } from './FighterPresentation';
import { FighterAnimationStateMachine, type FighterAnimationState } from './FighterAnimationState';
import {
  FIGHTER_GROUND_Y,
  resolveVisualFacing,
  STAGE_MAX_X,
  STAGE_MIN_X,
  stepVerticalMotion,
} from './CombatMovement';

export { FIGHTER_GROUND_Y } from './CombatMovement';

export class Fighter {
  readonly definition: CharacterDefinition;
  readonly view: Phaser.GameObjects.Container;
  health: number;
  meter = 0;
  facing: 1 | -1 = 1;
  velocityY = 0;
  nextActionAt = 0;

  private readonly scene: Phaser.Scene;
  private readonly visual: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly guardLabel: Phaser.GameObjects.Text;
  private readonly guardShield: Phaser.GameObjects.Ellipse;
  private _blocking = false;
  private crouching = false;
  private movementDirection: -1 | 1 = 1;
  private movingUntil = 0;
  private knockedOut = false;
  private flashRevision = 0;
  private presentationRevision = 0;
  private readonly animationState = new FighterAnimationStateMachine();

  constructor(scene: Phaser.Scene, definition: CharacterDefinition, x: number, facing: 1 | -1) {
    this.scene = scene;
    this.definition = definition;
    this.health = definition.stats.maxHealth;
    this.facing = facing;

    this.shadow = scene.add.ellipse(0, 4, 76, 12, 0x000000, 0.28);
    this.guardLabel = scene.add
      .text(0, -274, 'GUARD', {
        color: '#dff6ff',
        backgroundColor: '#163848',
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.guardShield = scene.add
      .ellipse(18, -112, 96, 210, 0x7bdcff, 0.08)
      .setStrokeStyle(4, 0xdff6ff, 0.9)
      .setVisible(false);
    const idleSheet = definition.art.idleSheet;
    this.visual = scene.add
      .sprite(0, 0, idleSheet?.textureKey ?? definition.art.fighterTextureKey)
      .setOrigin(0.5, 1);
    if (idleSheet) {
      if (!scene.anims.exists(idleSheet.animationKey)) {
        scene.anims.create({
          key: idleSheet.animationKey,
          frames: scene.anims.generateFrameNumbers(idleSheet.textureKey, {
            start: 0,
            end: idleSheet.frameCount - 1,
          }),
          frameRate: idleSheet.frameRate,
          repeat: -1,
        });
      }
      this.visual.play(idleSheet.animationKey);
    }
    for (const walkSheet of [definition.art.walkSheet, definition.art.walkLeftSheet]) {
      if (!walkSheet || scene.anims.exists(walkSheet.animationKey)) continue;
      scene.anims.create({
        key: walkSheet.animationKey,
        frames: scene.anims.generateFrameNumbers(walkSheet.textureKey, {
          ...(walkSheet.frameOrder
            ? { frames: [...walkSheet.frameOrder] }
            : { start: 0, end: walkSheet.frameCount - 1 }),
        }),
        frameRate: walkSheet.frameRate,
        repeat: -1,
      });
    }
    for (const sheet of [
      definition.art.jumpSheet,
      definition.art.landingSheet,
      definition.art.kickAttackSheet,
      definition.art.punchAttackSheet,
      definition.art.alternatePunchAttackSheet,
      definition.art.crouchPunchAttackSheet,
      definition.art.airKickAttackSheet,
      definition.art.airPunchAttackSheet,
      definition.art.hitSheet,
      definition.art.defeatSheet,
    ]) {
      if (!sheet || scene.anims.exists(sheet.animationKey)) continue;
      scene.anims.create({
        key: sheet.animationKey,
        frames: scene.anims.generateFrameNumbers(sheet.textureKey, {
          start: 0,
          end: sheet.frameCount - 1,
        }),
        frameRate: sheet.frameRate,
        repeat: 0,
      });
    }
    const crouchSheet = definition.art.crouchSheet;
    if (crouchSheet && !scene.anims.exists(crouchSheet.animationKey)) {
      const holdFrame = definition.art.crouchHoldFrame ?? Math.floor(crouchSheet.frameCount / 2);
      scene.anims.create({
        key: crouchSheet.animationKey,
        frames: scene.anims.generateFrameNumbers(crouchSheet.textureKey, { start: holdFrame, end: holdFrame }),
        frameRate: crouchSheet.frameRate,
        repeat: -1,
      });
    }
    const blockSheet = definition.art.blockSheet;
    if (blockSheet && !scene.anims.exists(blockSheet.animationKey)) {
      const holdFrame = definition.art.blockHoldFrame ?? Math.floor(blockSheet.frameCount / 2);
      scene.anims.create({
        key: blockSheet.animationKey,
        frames: scene.anims.generateFrameNumbers(blockSheet.textureKey, {
          start: holdFrame,
          end: holdFrame,
        }),
        frameRate: blockSheet.frameRate,
        repeat: -1,
      });
    }
    const reactionSheet = definition.art.reactionSheet;
    if (reactionSheet) {
      for (const clip of [reactionSheet.block, reactionSheet.hit, reactionSheet.landing]) {
        if (!clip || scene.anims.exists(clip.animationKey)) continue;
        scene.anims.create({
          key: clip.animationKey,
          frames: scene.anims.generateFrameNumbers(reactionSheet.textureKey, {
            start: clip.startFrame,
            end: clip.endFrame,
          }),
          frameRate: clip.frameRate,
          repeat: clip.repeat ?? 0,
          yoyo: clip.yoyo ?? false,
        });
      }
    }
    this.refreshVisualScale(1, idleSheet?.nativeFacing);

    this.view = scene.add.container(x, FIGHTER_GROUND_Y, [this.shadow, this.guardShield, this.visual, this.guardLabel]);
    this.setFacing(facing);
  }

  get x(): number {
    return this.view.x;
  }

  get y(): number {
    return this.view.y;
  }

  get isGrounded(): boolean {
    return this.view.y >= FIGHTER_GROUND_Y;
  }

  get blocking(): boolean {
    return this._blocking;
  }

  get isCrouching(): boolean {
    return this.crouching;
  }

  get presentationState(): FighterAnimationState {
    return this.animationState.current;
  }

  setFacing(facing: 1 | -1): void {
    this.facing = facing;
    const visualFacing = resolveVisualFacing(facing, this.definition.art.nativeFacing);
    this.view.setScale(visualFacing, 1);
    this.guardLabel.setScale(visualFacing, 1);
  }

  move(direction: -1 | 0 | 1, deltaSeconds: number): void {
    if (direction === 0) return;
    this.movementDirection = direction;
    const movingForward = direction === this.facing;
    const speed = movingForward ? this.definition.stats.walkSpeed : this.definition.stats.retreatSpeed;
    this.view.x = Phaser.Math.Clamp(this.view.x + direction * speed * deltaSeconds, STAGE_MIN_X, STAGE_MAX_X);
    this.movingUntil = this.scene.time.now + 70;
  }

  jump(): void {
    if (!this.isGrounded) return;
    this.velocityY = -this.definition.stats.jumpVelocity;
  }

  setBlocking(blocking: boolean): void {
    this._blocking = blocking;
    this.refreshGuardPresentation();
  }

  setCrouching(crouching: boolean): void {
    if (this.crouching === crouching) return;
    this.crouching = crouching;
    this.refreshVisualScale();
    this.refreshGuardPresentation();
  }

  updatePhysics(deltaSeconds: number): void {
    const motion = stepVerticalMotion(this.view.y, this.velocityY, deltaSeconds, FIGHTER_GROUND_Y);
    this.view.y = motion.y;
    this.velocityY = motion.velocityY;
    const heightAboveGround = Math.max(0, FIGHTER_GROUND_Y - this.view.y);
    const jumpHeight = Phaser.Math.Clamp(heightAboveGround / 160, 0, 1);
    this.shadow
      .setPosition(0, heightAboveGround + 4)
      .setScale(1 - jumpHeight * 0.3, 1 - jumpHeight * 0.12)
      .setAlpha(0.28 - jumpHeight * 0.13);
  }

  updatePresentation(time: number): void {
    const moving = time < this.movingUntil;
    const state = this.animationState.update({
      now: time,
      grounded: this.isGrounded,
      velocityY: this.velocityY,
      moving,
      blocking: this._blocking,
      crouching: this.crouching,
      landingDurationMs: this.definition.art.landingSheet
        ? (this.definition.art.landingSheet.frameCount / this.definition.art.landingSheet.frameRate) * 1000
        : undefined,
    });

    if (state === 'ko' || state === 'attack' || state === 'hit') return;

    if (state === 'crouch') {
      const crouchSheet = this.definition.art.crouchSheet;
      this.playMotionAnimation(crouchSheet?.animationKey ?? this.definition.art.idleSheet?.animationKey);
      this.visual.setPosition(0, 0).setAngle(0);
      this.refreshVisualScale(1, crouchSheet?.nativeFacing ?? this.definition.art.idleSheet?.nativeFacing);
      return;
    }

    if (state === 'jump' || state === 'fall') {
      const jumpAnimation = this.definition.art.jumpSheet?.animationKey;
      if (jumpAnimation) {
        if (this.visual.anims.currentAnim?.key !== jumpAnimation) this.visual.play(jumpAnimation);
        this.refreshVisualScale(1, this.definition.art.jumpSheet?.nativeFacing);
      } else {
        this.visual.anims.pause();
        this.visual.setAngle(Phaser.Math.Clamp(this.velocityY / 55, -7, 7));
      }
      this.visual.setY(0);
      return;
    }

    if (state === 'landing') {
      const reactionSheet = this.definition.art.reactionSheet;
      const landingSheet = this.definition.art.landingSheet;
      const landingAnimation = landingSheet?.animationKey ?? reactionSheet?.landing?.animationKey;
      this.playMotionAnimation(landingAnimation ?? this.definition.art.idleSheet?.animationKey);
      this.visual.setPosition(0, 0).setAngle(0);
      this.refreshVisualScale(
        1,
        landingSheet?.nativeFacing ?? (landingAnimation ? reactionSheet?.nativeFacing : this.definition.art.idleSheet?.nativeFacing),
      );
      return;
    }

    const walkSheet = this.movementDirection < 0
      ? this.definition.art.walkLeftSheet ?? this.definition.art.walkSheet
      : this.definition.art.walkSheet ?? this.definition.art.walkLeftSheet;
    const motionNativeFacing = state === 'block'
      ? this.definition.art.blockSheet?.nativeFacing ?? this.definition.art.reactionSheet?.nativeFacing
      : state === 'idle'
        ? this.definition.art.idleSheet?.nativeFacing
        : state === 'walk'
          ? walkSheet?.nativeFacing
          : undefined;
    const motionAnimation = state === 'walk'
      ? walkSheet?.animationKey
      : state === 'block'
        ? this.definition.art.blockSheet?.animationKey ?? this.definition.art.reactionSheet?.block.animationKey
        : this.definition.art.idleSheet?.animationKey;
    this.playMotionAnimation(motionAnimation);
    this.refreshVisualScale(1, motionNativeFacing);
    this.visual.setX(state === 'block' ? -7 : 0);
    const usesAuthoredMotion = state === 'walk'
      ? Boolean(walkSheet)
      : state === 'block'
        ? Boolean(this.definition.art.blockSheet ?? this.definition.art.reactionSheet)
        : Boolean(this.definition.art.idleSheet);
    this.visual.setY(usesAuthoredMotion ? 0 : Math.sin(time / (state === 'walk' ? 55 : 210)) * (state === 'walk' ? 3.5 : 1.8));
    this.visual.setAngle(usesAuthoredMotion ? 0 : state === 'walk' ? Math.sin(time / 70) * 1.8 : 0);
  }

  canAct(now: number): boolean {
    return now >= this.nextActionAt;
  }

  attack(move: MoveDefinition, now: number): void {
    const presentation = getAttackPresentation(this.definition.moves, move);
    const authoredAnimation = getAuthoredAttackAnimation(this.definition.moves, move, this.crouching);
    const attackSheet: CharacterAnimationSheet | undefined = authoredAnimation === 'kick'
      ? this.definition.art.kickAttackSheet
      : authoredAnimation === 'airKick'
        ? this.definition.art.airKickAttackSheet
        : authoredAnimation === 'airPunch'
          ? this.definition.art.airPunchAttackSheet
        : authoredAnimation === 'crouchPunch'
          ? this.definition.art.crouchPunchAttackSheet ?? this.definition.art.punchAttackSheet
          : authoredAnimation === 'punch'
            ? this.definition.art.alternatePunchAttackSheet
              ? selectPunchAnimationSheet(
                this.definition.art.punchAttackSheet,
                this.definition.art.alternatePunchAttackSheet,
                this.definition.art.alternatePunchChance ?? 0,
                Math.random(),
              )
              : this.definition.art.punchAttackSheet
            : undefined;
    const durationMs = attackSheet
      ? Math.round((attackSheet.frameCount / attackSheet.frameRate) * 1000)
      : presentation.durationMs * 2;
    this.nextActionAt = now + Math.max(move.cooldownMs, durationMs);
    const revision = ++this.presentationRevision;
    this.animationState.beginAttack(now, durationMs);
    this.scene.tweens.killTweensOf(this.visual);
    this.flashCombatFeedback('attack');
    if (attackSheet) {
      this.visual.play(attackSheet.animationKey, true);
      this.refreshVisualScale(1, attackSheet.nativeFacing);
    } else {
      this.visual.anims.pause();
      this.refreshVisualScale(presentation.scale);
    }
    this.scene.tweens.add({
      targets: this.visual,
      x: presentation.lunge,
      y: attackSheet ? 0 : presentation.offsetY,
      angle: attackSheet ? 0 : presentation.angle,
      duration: presentation.durationMs,
      ease: 'Power2',
      yoyo: true,
    });
    this.scene.time.delayedCall(durationMs, () => {
      if (this.presentationRevision !== revision || this.knockedOut) return;
      this.visual.setPosition(0, 0).setAngle(0);
      this.updatePresentation(this.scene.time.now);
    });
  }

  takeHit(move: MoveDefinition, blocked: boolean, damageMultiplier = 1): number {
    const damage = calculateHitDamage(move, blocked, damageMultiplier);
    this.health = Math.max(0, this.health - damage);
    this.meter = Phaser.Math.Clamp(this.meter + (blocked ? 6 : 12), 0, 100);
    const stunMs = getHitStunMs(move, blocked);
    this.nextActionAt = Math.max(this.nextActionAt, this.scene.time.now + stunMs);
    this.flashCombatFeedback(blocked ? 'guard' : 'hit');
    const hitSheet = blocked ? undefined : this.definition.art.hitSheet;
    const presentationDuration = blocked
      ? 130
      : hitSheet
        ? Math.max(180, Math.round((hitSheet.frameCount / hitSheet.frameRate) * 1000))
        : 180;
    const revision = ++this.presentationRevision;
    this.animationState.beginHit(this.scene.time.now, presentationDuration);
    this.scene.tweens.killTweensOf(this.visual);
    const reactionAnimation = blocked
      ? this.definition.art.blockSheet?.animationKey ?? this.definition.art.reactionSheet?.block.animationKey
      : hitSheet?.animationKey ?? this.definition.art.reactionSheet?.hit.animationKey;
    if (reactionAnimation) {
      this.visual.play(reactionAnimation, true);
      this.refreshVisualScale(1, getReactionNativeFacing(this.definition, blocked));
    } else {
      this.visual.anims.pause();
    }
    if (!hitSheet) {
      this.scene.tweens.add({
        targets: this.visual,
        x: blocked ? -8 : -22,
        y: blocked ? 0 : -9,
        angle: blocked ? -2 : -8,
        duration: blocked ? 65 : 90,
        ease: 'Power2',
        yoyo: true,
      });
    }
    if (blocked) {
      this.guardShield.setAlpha(1).setScale(1.12);
      this.scene.tweens.add({
        targets: this.guardShield,
        alpha: 0.42,
        scale: 1,
        duration: 130,
        ease: 'Power2',
      });
    }
    this.scene.time.delayedCall(presentationDuration, () => {
      if (this.presentationRevision !== revision || this.knockedOut) return;
      this.visual.setPosition(this._blocking ? -7 : 0, 0).setAngle(0);
      this.playMotionAnimation(this.definition.art.idleSheet?.animationKey);
      this.refreshVisualScale(1, this.definition.art.idleSheet?.nativeFacing);
    });
    const pushDistance = blocked ? Math.max(8, move.knockback * 0.28) : move.knockback;
    this.view.x = Phaser.Math.Clamp(this.view.x - this.facing * pushDistance, STAGE_MIN_X, STAGE_MAX_X);
    if (this.health === 0) this.knockOut();
    return damage;
  }

  gainMeter(amount: number): void {
    this.meter = Phaser.Math.Clamp(this.meter + amount, 0, 100);
  }

  spendSuper(): void {
    this.meter = 0;
  }

  reset(x: number, facing: 1 | -1): void {
    this.scene.tweens.killTweensOf(this.visual);
    this.scene.tweens.killTweensOf(this.view);
    this.view.setPosition(x, FIGHTER_GROUND_Y);
    this.setFacing(facing);
    this.health = this.definition.stats.maxHealth;
    this.meter = 0;
    this.velocityY = 0;
    this.setBlocking(false);
    this.setCrouching(false);
    this.nextActionAt = 0;
    this.movingUntil = 0;
    this.movementDirection = facing;
    this.knockedOut = false;
    this.flashRevision += 1;
    this.presentationRevision += 1;
    this.animationState.reset();
    this.visual.clearTint().setPosition(0, 0).setAngle(0).setAlpha(1);
    if (this.definition.art.idleSheet) this.visual.play(this.definition.art.idleSheet.animationKey, true);
    this.refreshVisualScale(1, this.definition.art.idleSheet?.nativeFacing);
  }

  private knockOut(): void {
    this.knockedOut = true;
    this.flashRevision += 1;
    this.presentationRevision += 1;
    this.animationState.knockOut();
    this.scene.tweens.killTweensOf(this.visual);
    this.scene.tweens.killTweensOf(this.view);
    this.visual.clearTint();
    const defeatSheet = this.definition.art.defeatSheet;
    if (defeatSheet) {
      const durationMs = Math.round((defeatSheet.frameCount / defeatSheet.frameRate) * 1000);
      const grounded = this.isGrounded;
      const frameHalfWidth = (defeatSheet.frameWidth * Math.abs(this.visual.scaleX)) / 2;
      const targetX = Phaser.Math.Clamp(
        this.view.x,
        STAGE_MIN_X + frameHalfWidth,
        STAGE_MAX_X - frameHalfWidth,
      );
      const positionTarget: { x?: number; y?: number } = {};
      if (Math.abs(targetX - this.view.x) > 0.5) positionTarget.x = targetX;
      if (!grounded) {
        this.velocityY = 0;
        positionTarget.y = FIGHTER_GROUND_Y;
      }
      if (Object.keys(positionTarget).length > 0) {
        this.scene.tweens.add({ targets: this.view, ...positionTarget, duration: durationMs, ease: 'Quad.InOut' });
      }
      this.visual.setPosition(0, 0).setAngle(0).setAlpha(1);
      this.visual.play(defeatSheet.animationKey, true);
      this.refreshVisualScale(1, defeatSheet.nativeFacing);
      return;
    }
    this.scene.tweens.add({
      targets: this.visual,
      angle: 82,
      x: -34,
      y: 10,
      alpha: 0.82,
      duration: 360,
      ease: 'Bounce.Out',
    });
  }

  private refreshVisualScale(multiplier = 1, animationNativeFacing?: 1 | -1): void {
    const defaultNativeFacing = this.definition.art.nativeFacing ?? 1;
    const localFacing = animationNativeFacing && animationNativeFacing !== defaultNativeFacing ? -1 : 1;
    const frameScale = (255 / this.visual.frame.height) * (this.definition.art.renderScale ?? 1);
    this.visual.setScale(
      frameScale * multiplier * localFacing,
      frameScale * multiplier * (this.crouching && !this.definition.art.crouchSheet ? 0.78 : 1),
    );
  }

  private refreshGuardPresentation(): void {
    this.guardLabel
      .setText(this.crouching ? 'LOW GUARD' : 'STAND GUARD')
      .setY(this.crouching ? -182 : -274)
      .setVisible(this._blocking);
    this.guardShield
      .setPosition(18, this.crouching ? -68 : -112)
      .setDisplaySize(96, this.crouching ? 118 : 210)
      .setAlpha(0.72)
      .setScale(1)
      .setVisible(this._blocking);
  }

  private flashCombatFeedback(kind: CombatFeedbackKind): void {
    const profile = getCombatFlashProfile(kind, this.definition.palette.accent);
    const revision = ++this.flashRevision;
    const tintMode = profile.mode === 'multiply' ? Phaser.TintModes.MULTIPLY : Phaser.TintModes.OVERLAY;
    this.visual.setTint(profile.color).setTintMode(tintMode);
    this.scene.time.delayedCall(profile.durationMs, () => {
      if (this.flashRevision !== revision || this.knockedOut) return;
      this.visual.clearTint();
    });
  }

  private playMotionAnimation(animationKey?: string): void {
    if (!animationKey) return;
    if (this.visual.anims.currentAnim?.key === animationKey) {
      this.visual.anims.resume();
      return;
    }
    this.visual.play(animationKey);
  }
}

