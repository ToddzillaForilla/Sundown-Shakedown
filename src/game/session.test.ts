import { describe, expect, it } from 'vitest';
import { completeRound, createMatchState } from '../engine/combat/MatchState';
import { applyFightSelection, type GameSession } from './session';

describe('fight session transitions', () => {
  it('applies character and difficulty choices before entering a fight', () => {
    const session: GameSession = { playerCharacter: 'todd', difficulty: 'normal' };

    applyFightSelection(session, 'kristen', 'hard');

    expect(session).toEqual({ playerCharacter: 'kristen', difficulty: 'hard' });
  });

  it('starts rematches and character-changed fights with clean match state', () => {
    const completedMatch = createMatchState();
    completeRound(completedMatch, 'opponent');
    completeRound(completedMatch, 'opponent');

    const session: GameSession = { playerCharacter: 'todd', difficulty: 'easy' };
    applyFightSelection(session, 'kristen', 'normal');
    const characterChangedFight = createMatchState();
    const rematch = createMatchState();

    expect(session.playerCharacter).toBe('kristen');
    expect(characterChangedFight).toEqual(rematch);
    expect(rematch).toEqual({
      roundNumber: 1,
      roundSeconds: 60,
      playerWins: 0,
      opponentWins: 0,
    });
  });
});
