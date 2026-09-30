import Phaser from 'phaser';
import type { Difficulty } from '../../game/session';
import type { Fighter } from '../combat/Fighter';
import type { MoveDefinition } from '../../content/characters';

export interface AiIntent {
  move: -1 | 0 | 1;
  jump: boolean;
  block: boolean;
  attack?: MoveDefinition;
}

const decisionWindows: Record<Difficulty, number> = {
  easy: 520,
  normal: 330,
  hard: 190,
};

export class OpponentAi {
  private nextDecisionAt = 0;
  private intent: AiIntent = { move: 0, jump: false, block: false };

  constructor(private readonly difficulty: Difficulty) {}

  update(now: number, self: Fighter, opponent: Fighter): AiIntent {
    if (now < this.nextDecisionAt) return this.intent;
    this.nextDecisionAt = now + decisionWindows[this.difficulty] + Phaser.Math.Between(-60, 90);

    const distance = Math.abs(opponent.x - self.x);
    const toward: -1 | 1 = opponent.x > self.x ? 1 : -1;
    const aggression = this.difficulty === 'easy' ? 0.42 : this.difficulty === 'normal' ? 0.62 : 0.78;

    if (distance > 150) {
      this.intent = {
        move: toward,
        jump: Phaser.Math.FloatBetween(0, 1) < 0.08,
        block: false,
      };
      return this.intent;
    }

    const roll = Phaser.Math.FloatBetween(0, 1);
    if (roll < aggression && self.canAct(now)) {
      let attack: MoveDefinition;
      const superChance = this.difficulty === 'easy' ? 0.18 : this.difficulty === 'normal' ? 0.42 : 0.68;
      const specialChance = this.difficulty === 'easy' ? 0.16 : this.difficulty === 'normal' ? 0.28 : 0.4;
      if (self.meter >= 100 && distance <= self.definition.moves.super.range && Phaser.Math.FloatBetween(0, 1) < superChance) {
        attack = self.definition.moves.super;
      } else if (distance <= self.definition.moves.special.range && Phaser.Math.FloatBetween(0, 1) < specialChance) {
        attack = self.definition.moves.special;
      } else {
        attack = roll < aggression * 0.42 ? self.definition.moves.heavy : self.definition.moves.light;
      }
      this.intent = { move: 0, jump: false, block: false, attack };
    } else {
      const retreat: -1 | 1 = toward === 1 ? -1 : 1;
      this.intent = { move: roll > 0.9 ? retreat : 0, jump: false, block: true };
    }
    return this.intent;
  }
}

