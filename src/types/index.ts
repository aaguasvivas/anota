export type TeamId = 'A' | 'B';

export type Round = {
  id: string;
  teamId: TeamId;
  points: number;
  timestamp: number;
};

export type Team = {
  id: TeamId;
  name: string;
  score: number;
  color: string;
};

export type MatchState = {
  teams: Record<TeamId, Team>;
  targetScore: number;
  rounds: Round[];
  winnerId: TeamId | null;
  winnerAcknowledged: boolean;
  startedAt: number;
};
