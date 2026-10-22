import { describe, expect, it, vi } from 'vitest';
import { createMatchState, createRoundEndLatch } from '../../engine/combat/MatchState';
import { FightScene } from './FightScene';

vi.mock('phaser', () => ({ default: { Scene: class {} } }));
vi.mock('../config', () => ({ GAME_WIDTH: 960, GAME_HEIGHT: 540 }));

// Exercise the actual scene's round resolution and delayed result callback without a renderer.
function setup(playerName = 'Todd') {
  const scene = new FightScene() as any;
  const fighter = (displayName: string) => ({
    definition: { displayName }, health: 100, playVictory: vi.fn(),
  });
  scene.player = fighter(playerName);
  scene.opponent = fighter(playerName === 'Todd' ? 'Kristen' : 'Todd');
  scene.match = createMatchState();
  scene.roundEndLatch = createRoundEndLatch();
  scene.playerWinMarkers = [];
  scene.opponentWinMarkers = [];
  const callbacks: Array<() => void> = [];
  scene.time = { delayedCall: vi.fn((_delay, callback) => callbacks.push(callback)) };
  scene.showAnnouncement = vi.fn();
  scene.createResultButton = vi.fn();
  const text = { height: 50 } as any;
  for (const name of ['setFontSize', 'setLineSpacing', 'setPosition']) text[name] = () => text;
  scene.announcement = text;
  scene.startRound = vi.fn();
  const finish = (playerHealth: number, opponentHealth: number) => {
    scene.roundActive = true;
    scene.roundEndLatch = createRoundEndLatch();
    scene.player.health = playerHealth;
    scene.opponent.health = opponentHealth;
    scene.endRound();
    callbacks.splice(0).forEach((callback) => callback());
  };
  return { scene, finish };
}

describe('match victory presentation', () => {
  it.each(['Todd', 'Kristen'])('starts Kristen victory only on her match win with %s as player', (playerName) => {
    const { scene, finish } = setup(playerName);
    const playerWins = playerName === 'Kristen';
    const winner = playerWins ? scene.player : scene.opponent;
    finish(playerWins ? 100 : 0, playerWins ? 0 : 100);
    expect(winner.playVictory).not.toHaveBeenCalled();
    finish(playerWins ? 100 : 0, playerWins ? 0 : 100);
    expect(winner.playVictory).toHaveBeenCalledTimes(1);
    expect(scene.showAnnouncement).toHaveBeenLastCalledWith('KRISTEN\nSHAKES DOWN THE BACKYARD');
  });
  it('celebrates only after the deciding win, alongside the shakes-down text', () => {
    const { scene, finish } = setup();
    finish(100, 0);
    expect(scene.player.playVictory).not.toHaveBeenCalled();
    finish(0, 100);
    expect(scene.opponent.playVictory).not.toHaveBeenCalled();
    finish(100, 0);
    expect(scene.player.playVictory).toHaveBeenCalledTimes(1);
    expect(scene.opponent.playVictory).not.toHaveBeenCalled();
    expect(scene.showAnnouncement).toHaveBeenLastCalledWith('TODD\nSHAKES DOWN THE BACKYARD');
    expect(scene.createResultButton).toHaveBeenCalledTimes(2);
    scene.endRound();
    expect(scene.player.playVictory).toHaveBeenCalledTimes(1);
  });

  it('celebrates the AI winner too and never celebrates drawn rounds', () => {
    const { scene, finish } = setup('Kristen');
    finish(100, 100);
    finish(0, 100);
    expect(scene.opponent.playVictory).not.toHaveBeenCalled();
    finish(0, 100);
    expect(scene.opponent.playVictory).toHaveBeenCalledTimes(1);
    expect(scene.player.playVictory).not.toHaveBeenCalled();
    expect(scene.showAnnouncement).toHaveBeenLastCalledWith('TODD\nSHAKES DOWN THE BACKYARD');
  });
});
