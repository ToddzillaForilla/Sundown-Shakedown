import Phaser from 'phaser';
import type { CharacterDefinition, MoveDefinition } from '../../content/characters';
import { getAttackPresentation, getHitStunMs } from './CombatAttacks';
import { calculateHitDamage } from './CombatBlocking';
import { getCombatFlashProfile, type CombatFeedbackKind } from './CombatEffects';
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
  private readonly guardLabel: Phaser.GameObjects.Text;
  private readonly guardShield: Phaser.GameObjects.Ellipse;
  private readonly baseVisualScale: number;
  private _blocking = false;
  private crouching = false;
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

    const shadow = scene.add.ellipse(0, 4, 110, 24, 0x000000, 0.4);
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
    const walkSheet = definition.art.walkSheet;
    if (walkSheet && !scene.anims.exists(walkSheet.animationKey)) {
      scene.anims.create({
        key: walkSheet.animationKey,
        frames: scene.anims.generateFrameNumbers(walkSheet.textureKey, {
          start: 0,
          end: walkSheet.frameCount - 1,
        }),
        frameRate: walkSheet.frameRate,
        repeat: -1,
      });
    }
    this.baseVisualScale = (255 / this.visual.height) * (definition.art.renderScale ?? 1);
    this.visual.setScale(this.baseVisualScale);

    this.view = scene.add.container(x, FIGHTER_GROUND_Y, [shadow, this.guardShield, this.visual, this.guardLabel]);
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
    });

    if (state === 'ko' || state === 'attack' || state === 'hit') return;

    if (state === 'crouch') {
      this.playMotionAnimation(this.definition.art.idleSheet?.animationKey);
      this.visual.setPosition(0, 0).setAngle(0);
      return;
    }

    if (state === 'jump' || state === 'fall') {
      this.visual.anims.pause();
      this.visual.setY(0);
      this.visual.setAngle(Phaser.Math.Clamp(this.velocityY / 55, -7, 7));
      return;
    }

    if (state === 'landing') {
      this.playMotionAnimation(this.definition.art.idleSheet?.animationKey);
      this.visual.setPosition(0, 2).setAngle(0);
      this.refreshVisualScale();
      this.visual.scaleY *= 0.92;
      return;
    }

    this.refreshVisualScale();
    const motionAnimation = state === 'walk'
      ? this.definition.art.walkSheet?.animationKey
      : this.definition.art.idleSheet?.animationKey;
    this.playMotionAnimation(motionAnimation);
    this.visual.setX(state === 'block' ? -7 : 0);
    const usesAuthoredMotion = state === 'walk'
      ? Boolean(this.definition.art.walkSheet)
      : Boolean(this.definition.art.idleSheet);
    this.visual.setY(usesAuthoredMotion ? 0 : Math.sin(time / (state === 'walk' ? 55 : 210)) * (state === 'walk' ? 3.5 : 1.8));
    this.visual.setAngle(usesAuthoredMotion ? 0 : state === 'walk' ? Math.sin(time / 70) * 1.8 : 0);
  }

  canAct(now: number): boolean {
    return now >= this.nextActionAt;
  }

  attack(move: MoveDefinition, now: number): void {
    this.nextActionAt = now + move.cooldownMs;
    const presentation = getAttackPresentation(this.definition.moves, move);
    const durationMs = presentation.durationMs * 2;
    const revision = ++this.presentationRevision;
    this.animationState.beginAttack(now, durationMs);
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.anims.pause();
    this.flashCombatFeedback('attack');
    this.refreshVisualScale(presentation.scale);
    this.scene.tweens.add({
      targets: this.visual,
      x: presentation.lunge,
      y: presentation.offsetY,
      angle: presentation.angle,
      duration: presentation.durationMs,
      ease: 'Power2',
      yoyo: true,
    });
    this.scene.time.delayedCall(durationMs, () => {
      if (this.presentationRevision !== revision || this.knockedOut) return;
      this.visual.setPosition(0, 0).setAngle(0);
      this.refreshVisualScale();
      this.visual.anims.resume();
    });
  }

  takeHit(move: MoveDefinition, blocked: boolean, damageMultiplier = 1): number {
    const damage = calculateHitDamage(move, blocked, damageMultiplier);
    this.health = Math.max(0, this.health - damage);
    this.meter = Phaser.Math.Clamp(this.meter + (blocked ? 6 : 12), 0, 100);
    const stunMs = getHitStunMs(move, blocked);
    this.nextActionAt = Math.max(this.nextActionAt, this.scene.time.now + stunMs);
    this.flashCombatFeedback(blocked ? 'guard' : 'hit');
    const presentationDuration = blocked ? 130 : 180;
    const revision = ++this.presentationRevision;
    this.animationState.beginHit(this.scene.time.now, presentationDuration);
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.anims.pause();
    this.scene.tweens.add({
      targets: this.visual,
      x: blocked ? -8 : -22,
      y: blocked ? 0 : -9,
      angle: blocked ? -2 : -8,
      duration: blocked ? 65 : 90,
      ease: 'Power2',
      yoyo: true,
    });
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
      this.visual.anims.resume();
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
    this.view.setPosition(x, FIGHTER_GROUND_Y);
    this.setFacing(facing);
    this.health = this.definition.stats.maxHealth;
    this.meter = 0;
    this.velocityY = 0;
    this.setBlocking(false);
    this.setCrouching(false);
    this.nextActionAt = 0;
    this.movingUntil = 0;
    this.knockedOut = false;
    this.flashRevision += 1;
    this.presentationRevision += 1;
    this.animationState.reset();
    this.visual.clearTint().setPosition(0, 0).setAngle(0).setAlpha(1);
    if (this.definition.art.idleSheet) this.visual.play(this.definition.art.idleSheet.animationKey, true);
    this.refreshVisualScale();
  }

  private knockOut(): void {
    this.knockedOut = true;
    this.flashRevision += 1;
    this.presentationRevision += 1;
    this.animationState.knockOut();
    this.scene.tweens.killTweensOf(this.visual);
    this.visual.clearTint();
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

  private refreshVisualScale(multiplier = 1): void {
    this.visual.setScale(
      this.baseVisualScale * multiplier,
      this.baseVisualScale * multiplier * (this.crouching ? 0.78 : 1),
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

