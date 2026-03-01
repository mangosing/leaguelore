// ============================================================================
// League & Platform Types
// ============================================================================

export type Platform = 'ESPN' | 'YAHOO' | 'SLEEPER';
export type ScoringType = 'STANDARD' | 'HALF_PPR' | 'PPR' | 'CUSTOM';
export type LeagueType = 'REDRAFT' | 'KEEPER' | 'DYNASTY';
export type DraftType = 'SNAKE' | 'AUCTION' | 'LINEAR';
export type MatchupType = 'REGULAR' | 'PLAYOFF' | 'CONSOLATION' | 'CHAMPIONSHIP' | 'TOILET_BOWL';
export type RosterMoveType = 'WAIVER_ADD' | 'FREE_AGENT_ADD' | 'DROP' | 'IR_MOVE';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DL' | 'LB' | 'DB' | 'FLEX';

// ============================================================================
// Normalized Types — What adapters return after transforming platform data
// ============================================================================

export interface NormalizedLeagueSettings {
  platformLeagueId: string;
  name: string;
  scoringType: ScoringType;
  leagueType: LeagueType;
  teamCount: number;
  /** Available season years for this league (e.g., [2019, 2020, 2021, ...]) */
  availableSeasons: number[];
  rosterSlots: NormalizedRosterSlot[];
}

export interface NormalizedRosterSlot {
  position: Position;
  count: number;
}

export interface NormalizedManager {
  platformManagerId: string;
  displayName: string;
  teamName: string;
  platformTeamId: string;
  isCommissioner: boolean;
  avatarUrl?: string;
}

export interface NormalizedMatchup {
  week: number;
  matchupType: MatchupType;
  homeTeam: NormalizedMatchupTeam;
  awayTeam: NormalizedMatchupTeam;
  isComplete: boolean;
}

export interface NormalizedMatchupTeam {
  platformTeamId: string;
  score: number | null;
}

export interface NormalizedDraft {
  draftType: DraftType;
  draftDate: Date | null;
  rounds: number;
  picks: NormalizedDraftPick[];
}

export interface NormalizedDraftPick {
  round: number;
  pickNumber: number;
  pickInRound: number;
  platformTeamId: string;
  platformPlayerId: string;
  auctionPrice?: number;
}

export interface NormalizedTransaction {
  type: RosterMoveType | 'TRADE';
  week: number;
  timestamp: Date;
  platformTeamId: string;
  platformPlayerId: string;
  faabBid?: number;
  /** For trades — groups multiple transaction rows into one trade */
  tradeGroupId?: string;
}

export interface NormalizedPlayer {
  platformPlayerId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  position: Position;
  nflTeam?: string;
  headshotUrl?: string;
}
