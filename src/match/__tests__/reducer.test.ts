import {
  acknowledgeWinner,
  applyPoints,
  applyRemoveRound,
  applyRename,
  applyTarget,
  applyUndo,
  createMatch,
  detectWinner,
  resetKeepingSettings,
} from '../reducer';
import type { MatchState } from '../../types';

function base(): MatchState {
  return { ...createMatch(), targetScore: 100 };
}

test('applyPoints adds to score and records a round, most-recent-first', () => {
  let s = base();
  s = applyPoints(s, 'A', 30);
  s = applyPoints(s, 'A', 25);
  expect(s.teams.A.score).toBe(55);
  expect(s.rounds).toHaveLength(2);
  expect(s.rounds[0].points).toBe(25);
  expect(s.rounds[1].points).toBe(30);
});

test('detectWinner flags the team at or above target', () => {
  let s = base();
  s = applyPoints(s, 'B', 100);
  expect(s.winnerId).toBe('B');
  expect(detectWinner(s)).toBe('B');
});

test('applyUndo reverses the last round and clears winner state', () => {
  let s = base();
  s = applyPoints(s, 'A', 100);
  expect(s.winnerId).toBe('A');
  s = applyUndo(s);
  expect(s.teams.A.score).toBe(0);
  expect(s.winnerId).toBeNull();
  expect(s.winnerAcknowledged).toBe(false);
  expect(s.rounds).toHaveLength(0);
});

test('applyRemoveRound removes a specific round and re-derives score', () => {
  let s = base();
  s = applyPoints(s, 'A', 30);
  const firstId = s.rounds[0].id;
  s = applyPoints(s, 'A', 25);
  s = applyRemoveRound(s, firstId);
  expect(s.teams.A.score).toBe(25);
  expect(s.rounds).toHaveLength(1);
  expect(s.rounds.find((r) => r.id === firstId)).toBeUndefined();
});

test('scoring is blocked while an unacknowledged winner modal is up', () => {
  let s = base();
  s = applyPoints(s, 'A', 100); // A wins, not acknowledged
  s = applyPoints(s, 'B', 10); // ignored
  expect(s.teams.B.score).toBe(0);
});

test('keep-playing: after acknowledge, more points do not re-arm the modal', () => {
  let s = base();
  s = applyPoints(s, 'A', 100);
  s = acknowledgeWinner(s);
  expect(s.winnerAcknowledged).toBe(true);
  s = applyPoints(s, 'B', 10); // allowed now
  expect(s.teams.B.score).toBe(10);
  expect(s.winnerId).toBe('A');
  expect(s.winnerAcknowledged).toBe(true); // still acknowledged → no modal
});

test('undo below target re-arms celebration (acknowledged resets)', () => {
  let s = base();
  s = applyPoints(s, 'A', 100);
  s = acknowledgeWinner(s);
  s = applyUndo(s);
  expect(s.winnerId).toBeNull();
  expect(s.winnerAcknowledged).toBe(false);
});

test('applyTarget lowering the target below a score declares a winner', () => {
  let s = base();
  s = applyPoints(s, 'A', 60);
  expect(s.winnerId).toBeNull();
  s = applyTarget(s, 50); // 60 >= 50 → A wins
  expect(s.targetScore).toBe(50);
  expect(s.winnerId).toBe('A');
});

test('applyRename trims and caps the name at 24 characters', () => {
  let s = base();
  s = applyRename(s, 'A', '  Los Gallos  ');
  expect(s.teams.A.name).toBe('Los Gallos');
  s = applyRename(s, 'B', 'x'.repeat(40));
  expect(s.teams.B.name).toHaveLength(24);
});

test('resetKeepingSettings keeps names + target, clears scores/rounds/winner', () => {
  let s = base();
  s = applyRename(s, 'A', 'Us');
  s = applyPoints(s, 'A', 100); // A wins at target 100
  expect(s.winnerId).toBe('A');
  const r = resetKeepingSettings(s);
  expect(r.teams.A.name).toBe('Us');
  expect(r.targetScore).toBe(100);
  expect(r.teams.A.score).toBe(0);
  expect(r.teams.B.score).toBe(0);
  expect(r.rounds).toHaveLength(0);
  expect(r.winnerId).toBeNull();
  expect(r.winnerAcknowledged).toBe(false);
});
