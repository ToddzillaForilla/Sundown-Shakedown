import Phaser from 'phaser';
import type { CharacterDefinition, MoveDefinition } from '../../content/characters';

export const FIGHTER_GROUND_Y = 402;

export class Fighter {
  readonly definition: CharacterDefinition;
  readonly view: Phaser.GameObjects.Container;
  health: number;
  meter = 0;
  facing: 1 | -1 = 1;
  velocityY = 0;
  nextActionAt = 0;

  private readonly scene: Phaser.Scene;
  private readonly visual: Phaser.GameObjects.Image;
  private readonly guardLabel: Phaser.GameObjects.Text;
  private readonly baseVisualScale: number;
  private _blocking = false;
  private crouching = false;
  private movingUntil = 0;
  private presentationLockUntil = 0;
  private knockedOut = false;

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
    this.visual = scene.add
      .image(0, 0, definition.art.fighterTextureKey)
      .setOrigin(0.5, 1);
    this.baseVisualScale = 255 / this.visual.height;
    this.visual.setScale(this.baseVisualScale);

    this.view = scene.add.container(x, FIGHTER_GROUND_Y, [shadow, this.guardLabel, this.visual]);
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

  setFacing(facing: 1 | -1): void {
    this.facing = facing;
    this.view.setScale(facing, 1);
    this.guardLabel.setScale(facing, 1);
  }

  move(direction: -1 | 0 | 1, deltaSeconds: number): void {
    if (direction === 0) return;
    const movingForward = direction === this.facing;
    const speed = movingForward ? this.definition.stats.walkSpeed : this.definition.stats.retreatSpeed;
    this.view.x = Phaser.Math.Clamp(this.view.x + direction * speed * deltaSeconds, 72, 888);
    this.movingUntil = this.scene.time.now + 70;
  }

  jump(): void {
    if (!this.isGrounded) return;
    this.velocityY = -this.definition.stats.jumpVelocity;
  }

  setBlocking(blocking: boolean): void {
    this._blocking = blocking;
    this.guardLabel.setVisible(blocking);
  }

  setCrouching(crouching: boolean): void {
    if (this.crouching === crouching) return;
    this.crouching = crouching;
    this.refreshVisualScale();
  }

  updatePhysics(deltaSeconds: number): void {
    if (!this.isGrounded || this.velocityY < 0) {
      this.velocityY += 1050 * deltaSeconds;
      this.view.y += this.velocityY * deltaSeconds;
      if (this.view.y >= FIGHTER_GROUND_Y) {
        this.view.y = FIGHTER_GROUND_Y;
        this.velocityY = 0;
      }
    }
  }

  updatePresentation(time: number): void {
    if (this.knockedOut || time < this.presentationLockUntil) return;

    if (this.crouching) {
      this.visual.setPosition(0, 0).setAngle(0);
      return;
    }

    if (!this.isGrounded) {
      this.visual.setY(0);
      this.visual.setAngle(Phaser.Math.Clamp(this.velocityY / 55, -7, 7));
      return;
    }

    const moving = time < this.movingUntil;
    this.visual.setX(this._blocking ? -7 : 0);
    this.visual.setY(Math.sin(time / (moving ? 55 : 210)) * (moving ? 3.5 : 1.8));
    this.visual.setAngle(moving ? Math.sin(time / 70) * 1.8 : 0);
  }

  canAct(now: number): boolean {
    return now >= this.nextActionAt;
  }

  attack(move: MoveDefinition, now: number): void {
    this.nextActionAt = now + move.cooldownMs;
    const duration = move.kind === 'light' ? 65 : move.kind === 'heavy' ? 95 : move.kind === 'special' ? 135 : 190;
    const lunge = move.kind === 'light' ? 12 : move.kind === 'heavy' ? 24 : move.kind === 'special' ? 38 : 52;
    this.presentationLockUntil = now + duration * 2 + 30;
    this.scene.tweens.killTweensOf(this.visual);
    this.visual
      .setTint(this.definition.palette.accent)
      .setTintMode(Phaser.TintModes.FILL);
    this.refreshVisualScale(1.04);
    this.scene.tweens.add({
      targets: this.visual,
      x: lunge,
      y: move.kind === 'super' ? -14 : -4,
      angle: move.kind === 'heavy' ? 7 : move.kind === 'super' ? -9 : 3,
      duration,
      ease: 'Power2',
      yoyo: true,
    });
    this.scene.time.delayedCall(duration * 2, () => {
      this.visual.clearTint();
      this.visual.setPosition(0, 0).setAngle(0);
      this.refreshVisualScale();
    });
  }

  takeHit(move: MoveDefinition, blocked: boolean): number {
    const damage = Math.round(move.damage * (blocked ? 0.18 : 1));
    this.health = Math.max(0, this.health - damage);
    this.meter = Phaser.Math.Clamp(this.meter + (blocked ? 6 : 12), 0, 100);
    const stunMs = blocked ? 110 : move.kind === 'light' ? 170 : move.kind === 'heavy' ? 260 : move.kind === 'special' ? 320 : 460;
    this.nextActionAt = Math.max(this.nextActionAt, this.scene.time.now + stunMs);
    this.visual
      .setTint(blocked ? 0xb4d7ff : 0xff4e62)
      .setTintMode(Phaser.TintModes.FILL);
    this.presentationLockUntil = this.scene.time.now + 180;
    this.scene.tweens.killTweensOf(this.visual);
    this.scene.tweens.add({
      targets: this.visual,
      x: blocked ? -8 : -22,
      y: blocked ? 0 : -9,
      angle: blocked ? -2 : -8,
      duration: blocked ? 65 : 90,
      ease: 'Power2',
      yoyo: true,
    });
    this.scene.time.delayedCall(blocked ? 130 : 180, () => {
      if (this.knockedOut) return;
      this.visual.clearTint();
      this.visual.setPosition(this._blocking ? -7 : 0, 0).setAngle(0);
    });
    if (!blocked) {
      this.view.x = Phaser.Math.Clamp(this.view.x - this.facing * 24, 72, 888);
    }
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
    this.presentationLockUntil = 0;
    this.knockedOut = false;
    this.visual.clearTint().setPosition(0, 0).setAngle(0).setAlpha(1);
    this.refreshVisualScale();
  }

  private knockOut(): void {
    this.knockedOut = true;
    this.presentationLockUntil = Number.POSITIVE_INFINITY;
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
}

