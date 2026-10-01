export const ROUND_SECONDS = 60;
export const WINS_TO_TAKE_MATCH = 2;

export type RoundWinner = 'player' | 'opponent' | 'draw';

export interface MatchState {
  roundNumber: number;
  roundSeconds: number;
  playerWins: number;
  opponentWins: number;
}

export interface RoundResult {
  winner: RoundWinner;
  matchOver: boolean;
  roundNumber: number;
  playerWins: number;
  opponentWins: number;
}

export interface RoundEndLatch {
  resolved: boolean;
}

export function createMatchState(): MatchState {
  return {
    roundNumber: 1,
    roundSeconds: ROUND_SECONDS,
    playerWins: 0,
    opponentWins: 0,
  };
}

export function completeRound(state: MatchState, winner: RoundWinner): RoundResult {
  if (winner === 'player') state.playerWins += 1;
  else if (winner === 'opponent') state.opponentWins += 1;

  const matchOver = state.playerWins >= WINS_TO_TAKE_MATCH
    || state.opponentWins >= WINS_TO_TAKE_MATCH;
  if (!matchOver) state.roundNumber += 1;

  return {
    winner,
    matchOver,
    roundNumber: state.roundNumber,
    playerWins: state.playerWins,
    opponentWins: state.opponentWins,
  };
}

export function resolveRoundWinner(playerHealth: number, opponentHealth: number): RoundWinner {
  if (playerHealth === opponentHealth) return 'draw';
  return playerHealth > opponentHealth ? 'player' : 'opponent';
}

export function createRoundEndLatch(): RoundEndLatch {
  return { resolved: false };
}

export function resetRoundEndLatch(latch: RoundEndLatch): void {
  latch.resolved = false;
}

export function completeRoundOnce(
  state: MatchState,
  latch: RoundEndLatch,
  playerHealth: number,
  opponentHealth: number,
): RoundResult | undefined {
  if (latch.resolved) return undefined;
  latch.resolved = true;
  return completeRound(state, resolveRoundWinner(playerHealth, opponentHealth));
}

export function resetRoundClock(state: MatchState): void {
  state.roundSeconds = ROUND_SECONDS;
}

export function tickRoundClock(state: MatchState): void {
  state.roundSeconds = Math.max(0, state.roundSeconds - 1);
}
