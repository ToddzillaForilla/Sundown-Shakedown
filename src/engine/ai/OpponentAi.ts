import type { CharacterDefinition, MoveDefinition } from '../../content/characters';
import type { Difficulty } from '../../game/session';
import { STAGE_MAX_X, STAGE_MIN_X } from '../combat/CombatMovement';

export interface AiIntent {
  move: -1 | 0 | 1;
  jump: boolean;
  block: boolean;
  attack?: MoveDefinition;
}

export interface AiDifficultyProfile {
  reactionMs: number;
  reactionJitterMs: number;
  aggression: number;
  defense: number;
  damageMultiplier: number;
  attackRecoveryMs: number;
  hesitationChance: number;
  retreatChance: number;
  maxCornerPressureAttacks: number;
  cornerReleaseMs: number;
  preferredRangeScale: number;
}

interface AiCombatant {
  x: number;
  meter: number;
  isGrounded: boolean;
  definition: CharacterDefinition;
  canAct(now: number): boolean;
}

const CORNER_ZONE = 112;

const difficultyProfiles: Record<Difficulty, AiDifficultyProfile> = {
  easy: {
    reactionMs: 620,
    reactionJitterMs: 100,
    aggression: 0.28,
    defense: 0.3,
    damageMultiplier: 0.76,
    attackRecoveryMs: 560,
    hesitationChance: 0.4,
    retreatChance: 0.52,
    maxCornerPressureAttacks: 1,
    cornerReleaseMs: 760,
    preferredRangeScale: 0.9,
  },
  normal: {
    reactionMs: 410,
    reactionJitterMs: 75,
    aggression: 0.48,
    defense: 0.46,
    damageMultiplier: 0.9,
    attackRecoveryMs: 390,
    hesitationChance: 0.24,
    retreatChance: 0.38,
    maxCornerPressureAttacks: 2,
    cornerReleaseMs: 590,
    preferredRangeScale: 0.82,
  },
  hard: {
    reactionMs: 235,
    reactionJitterMs: 45,
    aggression: 0.7,
    defense: 0.64,
    damageMultiplier: 1.05,
    attackRecoveryMs: 240,
    hesitationChance: 0.1,
    retreatChance: 0.24,
    maxCornerPressureAttacks: 3,
    cornerReleaseMs: 430,
    preferredRangeScale: 0.74,
  },
};

export function getAiDifficultyProfile(difficulty: Difficulty): Readonly<AiDifficultyProfile> {
  return difficultyProfiles[difficulty];
}

export function isNearStageCorner(x: number): boolean {
  return x <= STAGE_MIN_X + CORNER_ZONE || x >= STAGE_MAX_X - CORNER_ZONE;
}

export function shouldReleaseCornerPressure(
  opponentX: number,
  distance: number,
  consecutiveAttacks: number,
  profile: AiDifficultyProfile,
): boolean {
  return isNearStageCorner(opponentX)
    && distance < 124
    && consecutiveAttacks >= profile.maxCornerPressureAttacks;
}

export class OpponentAi {
  private readonly profile: Readonly<AiDifficultyProfile>;
  private nextDecisionAt = 0;
  private recoveryUntil = 0;
  private consecutiveAttacks = 0;
  private intent: AiIntent = { move: 0, jump: false, block: false };

  constructor(
    difficulty: Difficulty,
    private readonly random: () => number = Math.random,
  ) {
    this.profile = getAiDifficultyProfile(difficulty);
  }

  reset(): void {
    this.nextDecisionAt = 0;
    this.recoveryUntil = 0;
    this.consecutiveAttacks = 0;
    this.intent = { move: 0, jump: false, block: false };
  }

  update(now: number, self: AiCombatant, opponent: AiCombatant): AiIntent {
    if (now < this.nextDecisionAt) return this.intent;

    const jitter = (this.roll() * 2 - 1) * this.profile.reactionJitterMs;
    this.nextDecisionAt = now + this.profile.reactionMs + jitter;

    const distance = Math.abs(opponent.x - self.x);
    const toward: -1 | 1 = opponent.x > self.x ? 1 : -1;
    const retreat: -1 | 1 = toward === 1 ? -1 : 1;
    const preferredRange = Math.max(
      self.definition.moves.heavy.range,
      self.definition.moves.special.range * this.profile.preferredRangeScale,
    );

    if (now < this.recoveryUntil) {
      return this.setIntent({
        move: distance < preferredRange ? retreat : 0,
        jump: false,
        block: this.roll() < this.profile.defense * 0.45,
      });
    }

    if (shouldReleaseCornerPressure(opponent.x, distance, this.consecutiveAttacks, this.profile)) {
      this.consecutiveAttacks = 0;
      this.nextDecisionAt = now + this.profile.cornerReleaseMs;
      return this.setIntent({ move: retreat, jump: false, block: false });
    }

    if (!self.isGrounded && distance <= self.definition.moves.airHeavy.range + 12 && self.canAct(now)) {
      const useHeavy = this.roll() < this.profile.aggression * 0.65;
      return this.commitAttack(now, useHeavy ? self.definition.moves.airHeavy : self.definition.moves.airLight, toward);
    }

    if (distance > self.definition.moves.special.range + 34) {
      this.consecutiveAttacks = 0;
      return this.setIntent({
        move: toward,
        jump: this.roll() < this.profile.aggression * 0.12,
        block: false,
      });
    }

    if (distance < preferredRange * 0.62 && this.roll() < this.profile.retreatChance) {
      return this.setIntent({
        move: retreat,
        jump: false,
        block: this.roll() < this.profile.defense,
      });
    }

    if (distance > preferredRange && self.canAct(now)) {
      return this.setIntent({ move: toward, jump: false, block: false });
    }

    if (this.roll() < this.profile.hesitationChance) {
      return this.setIntent({
        move: this.roll() < this.profile.retreatChance ? retreat : 0,
        jump: false,
        block: this.roll() < this.profile.defense,
      });
    }

    const attackRoll = this.roll();
    if (attackRoll < this.profile.aggression && self.canAct(now)) {
      let attack: MoveDefinition;
      const superChance = this.profile.aggression * 0.68;
      const specialChance = this.profile.aggression * 0.55;
      if (self.meter >= 100 && distance <= self.definition.moves.super.range && this.roll() < superChance) {
        attack = self.definition.moves.super;
      } else if (distance <= self.definition.moves.special.range && this.roll() < specialChance) {
        attack = self.definition.moves.special;
      } else {
        attack = attackRoll < this.profile.aggression * 0.38
          ? self.definition.moves.heavy
          : self.definition.moves.light;
      }
      return this.commitAttack(now, attack, 0);
    }

    return this.setIntent({
      move: this.roll() < this.profile.retreatChance ? retreat : 0,
      jump: false,
      block: this.roll() < this.profile.defense,
    });
  }

  private commitAttack(now: number, attack: MoveDefinition, move: -1 | 0 | 1): AiIntent {
    this.consecutiveAttacks += 1;
    this.recoveryUntil = now + this.profile.attackRecoveryMs;
    this.nextDecisionAt = Math.max(this.nextDecisionAt, this.recoveryUntil);
    return this.setIntent({ move, jump: false, block: false, attack });
  }

  private setIntent(intent: AiIntent): AiIntent {
    this.intent = { move: intent.move, jump: intent.jump, block: intent.block };
    return intent;
  }

  private roll(): number {
    return Math.min(1, Math.max(0, this.random()));
  }
}
