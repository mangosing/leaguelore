// ============================================================================
// Analytics Types — Shapes returned by the analytics engine
// ============================================================================

export interface HeadToHeadSummary {
  manager1: { id: string; displayName: string };
  manager2: { id: string; displayName: string };
  manager1Wins: number;
  manager2Wins: number;
  ties: number;
  matchups: HeadToHeadMatchup[];
}

export interface HeadToHeadMatchup {
  seasonYear: number;
  week: number;
  matchupType: string;
  manager1Score: number;
  manager2Score: number;
  winnerId: string | null;
}

export interface ManagerCareerStats {
  managerId: string;
  displayName: string;
  seasonsPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  winPercentage: number;
  totalPointsFor: number;
  totalPointsAgainst: number;
  avgPointsPerWeek: number;
  championships: number;
  playoffAppearances: number;
  highestWeekScore: number;
  lowestWeekScore: number;
  /** "Luck" — actual wins vs expected wins if you played everyone each week */
  expectedWins: number;
  expectedLosses: number;
  luckFactor: number; // positive = lucky, negative = unlucky
}

export interface DraftGrade {
  managerId: string;
  displayName: string;
  seasonYear: number;
  grade: string; // A+, A, A-, B+, ... F
  totalValueOverReplacement: number;
  bestPick: DraftPickGrade;
  worstPick: DraftPickGrade;
  picks: DraftPickGrade[];
}

export interface DraftPickGrade {
  round: number;
  pickNumber: number;
  playerName: string;
  position: string;
  pointsScored: number;
  expectedPointsAtPick: number;
  valueOverExpected: number;
}

export interface LeagueRecord {
  recordType: string; // 'highest_week_score', 'biggest_blowout', 'longest_win_streak', etc.
  label: string;
  value: number;
  managerName: string;
  managerId: string;
  seasonYear: number;
  week?: number;
  description?: string;
}

export interface SeasonStanding {
  managerId: string;
  displayName: string;
  teamName: string;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  isPlayoffTeam: boolean;
  isChampion: boolean;
}
