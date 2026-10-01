import { describe, expect, it } from 'vitest';
import {
  completeRoundOnce,
  completeRound,
  createRoundEndLatch,
  createMatchState,
  resetRoundClock,
  resetRoundEndLatch,
  resolveRoundWinner,
  tickRoundClock,
} from './MatchState';

describe('match state', () => {
  it('creates a clean round-one state for a new fight or rematch', () => {
    const previousMatch = createMatchState();
    completeRound(previousMatch, 'opponent');
    completeRound(previousMatch, 'opponent');
    previousMatch.roundSeconds = 17;

    const nextMatch = createMatchState();

    expect(nextMatch).toEqual({
      roundNumber: 1,
      roundSeconds: 60,
      playerWins: 0,
      opponentWins: 0,
    });
  });

  it('advances rounds until one fighter earns two wins', () => {
    const match = createMatchState();

    expect(completeRound(match, 'player')).toEqual({
      winner: 'player',
      matchOver: false,
      roundNumber: 2,
      playerWins: 1,
      opponentWins: 0,
    });
    expect(completeRound(match, 'opponent')).toEqual({
      winner: 'opponent',
      matchOver: false,
      roundNumber: 3,
      playerWins: 1,
      opponentWins: 1,
    });
    expect(completeRound(match, 'player')).toEqual({
      winner: 'player',
      matchOver: true,
      roundNumber: 3,
      playerWins: 2,
      opponentWins: 1,
    });
  });

  it('resolves timer expiration from remaining health, including ties', () => {
    expect(resolveRoundWinner(42, 17)).toBe('player');
    expect(resolveRoundWinner(17, 42)).toBe('opponent');
    expect(resolveRoundWinner(42, 42)).toBe('draw');

    const match = createMatchState();
    expect(completeRound(match, 'draw')).toEqual({
      winner: 'draw',
      matchOver: false,
      roundNumber: 2,
      playerWins: 0,
      opponentWins: 0,
    });
  });

  it('awards a zero-health round only once even if resolution is requested again', () => {
    const match = createMatchState();
    const latch = createRoundEndLatch();

    expect(completeRoundOnce(match, latch, 55, 0)).toEqual({
      winner: 'player',
      matchOver: false,
      roundNumber: 2,
      playerWins: 1,
      opponentWins: 0,
    });
    expect(completeRoundOnce(match, latch, 55, 0)).toBeUndefined();
    expect(match.playerWins).toBe(1);

    resetRoundEndLatch(latch);
    expect(completeRoundOnce(match, latch, 0, 25)?.winner).toBe('opponent');
    expect(match).toMatchObject({ roundNumber: 3, playerWins: 1, opponentWins: 1 });
  });

  it('resets and clamps the round clock', () => {
    const match = createMatchState();
    for (let second = 0; second < 61; second += 1) tickRoundClock(match);
    expect(match.roundSeconds).toBe(0);

    resetRoundClock(match);
    expect(match.roundSeconds).toBe(60);
  });
});
