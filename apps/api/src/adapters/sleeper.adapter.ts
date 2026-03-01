import type {
  NormalizedLeagueSettings,
  NormalizedManager,
  NormalizedMatchup,
  NormalizedDraft,
  NormalizedTransaction,
  NormalizedPlayer,
  ScoringType,
  DraftType,
  Position,
} from '@leaguelore/shared';
import type { PlatformAdapter, PlatformCredentials } from './types';

// ============================================================================
// Sleeper API Types (raw responses)
// ============================================================================
// Sleeper API docs: https://docs.sleeper.com/
// Base URL: https://api.sleeper.app/v1
// No auth required for read operations.
// ============================================================================

interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  season_type: string;
  total_rosters: number;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  settings: {
    type: number; // 0 = redraft, 1 = keeper, 2 = dynasty
    draft_rounds: number;
    playoff_week_start: number;
    [key: string]: unknown;
  };
  previous_league_id: string | null; // Follow this chain for history
}

interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
  };
}

interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  starters: string[];
  players: string[];
}

interface SleeperDraftPick {
  round: number;
  pick_no: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  metadata: {
    amount?: string; // Auction price
    [key: string]: unknown;
  };
}

interface SleeperDraft {
  draft_id: string;
  type: string; // 'snake', 'auction', 'linear'
  start_time: number | null;
  settings: {
    rounds: number;
    [key: string]: unknown;
  };
}

interface SleeperTransaction {
  type: string; // 'trade', 'waiver', 'free_agent'
  transaction_id: string;
  status: string;
  leg: number; // Week number
  created: number; // Timestamp ms
  adds: Record<string, number> | null; // player_id -> roster_id
  drops: Record<string, number> | null;
  roster_ids: number[];
  settings: {
    waiver_bid?: number;
    [key: string]: unknown;
  } | null;
}

interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  position: string;
  team: string | null;
  status: string;
}

// ============================================================================
// Sleeper Adapter Implementation
// ============================================================================

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperAdapter implements PlatformAdapter {
  readonly platform = 'SLEEPER' as const;

  // ---------------------------------------------------------------------------
  // Internal fetch helper
  // ---------------------------------------------------------------------------
  private async fetch<T>(path: string): Promise<T> {
    const url = `${SLEEPER_BASE_URL}${path}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status} ${response.statusText} for ${path}`);
    }

    return response.json() as Promise<T>;
  }

  // ---------------------------------------------------------------------------
  // League Settings
  // ---------------------------------------------------------------------------
  async getLeagueSettings(
    leagueId: string,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedLeagueSettings> {
    const league = await this.fetch<SleeperLeague>(`/league/${leagueId}`);

    // Sleeper chains leagues by season via previous_league_id.
    // Walk backward to find all available seasons.
    const availableSeasons = [parseInt(league.season)];
    let prevId = league.previous_league_id;

    while (prevId) {
      const prevLeague = await this.fetch<SleeperLeague>(`/league/${prevId}`);
      availableSeasons.push(parseInt(prevLeague.season));
      prevId = prevLeague.previous_league_id;
    }

    return {
      platformLeagueId: league.league_id,
      name: league.name,
      scoringType: this.mapScoringType(league.scoring_settings),
      leagueType: this.mapLeagueType(league.settings.type),
      teamCount: league.total_rosters,
      availableSeasons: availableSeasons.sort((a, b) => a - b),
      rosterSlots: this.mapRosterSlots(league.roster_positions),
    };
  }

  // ---------------------------------------------------------------------------
  // Managers
  // ---------------------------------------------------------------------------
  async getManagers(
    leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedManager[]> {
    // Sleeper needs two calls: users (for names) and rosters (for team mapping)
    const [users, rosters] = await Promise.all([
      this.fetch<SleeperUser[]>(`/league/${leagueId}/users`),
      this.fetch<SleeperRoster[]>(`/league/${leagueId}/rosters`),
    ]);

    const userMap = new Map(users.map((u) => [u.user_id, u]));

    return rosters.map((roster) => {
      const user = userMap.get(roster.owner_id);
      return {
        platformManagerId: roster.owner_id,
        displayName: user?.display_name ?? `Team ${roster.roster_id}`,
        teamName: user?.display_name ?? `Team ${roster.roster_id}`,
        platformTeamId: String(roster.roster_id),
        isCommissioner: false, // TODO: Check against league.owner_id
        avatarUrl: user?.avatar
          ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
          : undefined,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Matchups
  // ---------------------------------------------------------------------------
  async getMatchups(
    leagueId: string,
    _seasonYear: number,
    week: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedMatchup[]> {
    const matchups = await this.fetch<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);

    // Sleeper groups matchups by matchup_id — same matchup_id = opponents
    const grouped = new Map<number, SleeperMatchup[]>();
    for (const m of matchups) {
      const group = grouped.get(m.matchup_id) ?? [];
      group.push(m);
      grouped.set(m.matchup_id, group);
    }

    const normalized: NormalizedMatchup[] = [];
    for (const [, pair] of grouped) {
      if (pair.length !== 2) continue; // Skip byes

      normalized.push({
        week,
        matchupType: 'REGULAR', // TODO: Determine playoff weeks from league settings
        homeTeam: {
          platformTeamId: String(pair[0].roster_id),
          score: pair[0].points ?? null,
        },
        awayTeam: {
          platformTeamId: String(pair[1].roster_id),
          score: pair[1].points ?? null,
        },
        isComplete: (pair[0].points ?? 0) > 0 || (pair[1].points ?? 0) > 0,
      });
    }

    return normalized;
  }

  // ---------------------------------------------------------------------------
  // Draft
  // ---------------------------------------------------------------------------
  async getDraft(
    leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedDraft | null> {
    const drafts = await this.fetch<SleeperDraft[]>(`/league/${leagueId}/drafts`);
    if (!drafts.length) return null;

    const draft = drafts[0]; // Most recent draft
    const picks = await this.fetch<SleeperDraftPick[]>(`/draft/${draft.draft_id}/picks`);

    return {
      draftType: this.mapDraftType(draft.type),
      draftDate: draft.start_time ? new Date(draft.start_time) : null,
      rounds: draft.settings.rounds,
      picks: picks.map((pick) => ({
        round: pick.round,
        pickNumber: pick.pick_no,
        pickInRound: ((pick.pick_no - 1) % draft.settings.rounds) + 1,
        platformTeamId: String(pick.roster_id),
        platformPlayerId: pick.player_id,
        auctionPrice: pick.metadata?.amount ? parseInt(pick.metadata.amount) : undefined,
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------
  async getTransactions(
    leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedTransaction[]> {
    const transactions: NormalizedTransaction[] = [];

    // Sleeper returns transactions per week, fetch all weeks
    // TODO: Determine total weeks from league settings
    for (let week = 1; week <= 18; week++) {
      const weekTxns = await this.fetch<SleeperTransaction[]>(
        `/league/${leagueId}/transactions/${week}`,
      );

      for (const txn of weekTxns) {
        if (txn.status !== 'complete') continue;

        if (txn.type === 'trade') {
          // Trades have both adds and drops across roster_ids
          const tradeGroupId = txn.transaction_id;

          if (txn.adds) {
            for (const [playerId, rosterId] of Object.entries(txn.adds)) {
              transactions.push({
                type: 'TRADE',
                week: txn.leg,
                timestamp: new Date(txn.created),
                platformTeamId: String(rosterId),
                platformPlayerId: playerId,
                tradeGroupId,
              });
            }
          }
        } else {
          // Waivers and free agent adds
          if (txn.adds) {
            for (const [playerId, rosterId] of Object.entries(txn.adds)) {
              transactions.push({
                type: txn.type === 'waiver' ? 'WAIVER_ADD' : 'FREE_AGENT_ADD',
                week: txn.leg,
                timestamp: new Date(txn.created),
                platformTeamId: String(rosterId),
                platformPlayerId: playerId,
                faabBid: txn.settings?.waiver_bid,
              });
            }
          }

          if (txn.drops) {
            for (const [playerId, rosterId] of Object.entries(txn.drops)) {
              transactions.push({
                type: 'DROP',
                week: txn.leg,
                timestamp: new Date(txn.created),
                platformTeamId: String(rosterId),
                platformPlayerId: playerId,
              });
            }
          }
        }
      }
    }

    return transactions;
  }

  // ---------------------------------------------------------------------------
  // Players (bulk)
  // ---------------------------------------------------------------------------
  async getAllPlayers(): Promise<NormalizedPlayer[]> {
    // WARNING: This returns ~10,000+ players and is a large payload (~30MB).
    // Sleeper asks that you cache this and only refresh once per day max.
    const players = await this.fetch<Record<string, SleeperPlayer>>('/players/nfl');

    return Object.entries(players)
      .filter(([, p]) => p.position && ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position))
      .map(([id, p]) => ({
        platformPlayerId: id,
        fullName: p.full_name || `${p.first_name} ${p.last_name}`,
        firstName: p.first_name,
        lastName: p.last_name,
        position: p.position as Position,
        nflTeam: p.team ?? undefined,
      }));
  }

  // ---------------------------------------------------------------------------
  // Mapping helpers
  // ---------------------------------------------------------------------------
  private mapScoringType(scoring: Record<string, number>): ScoringType {
    const ppr = scoring.rec ?? 0;
    if (ppr === 1) return 'PPR';
    if (ppr === 0.5) return 'HALF_PPR';
    if (ppr === 0) return 'STANDARD';
    return 'CUSTOM';
  }

  private mapLeagueType(type: number): 'REDRAFT' | 'KEEPER' | 'DYNASTY' {
    switch (type) {
      case 1:
        return 'KEEPER';
      case 2:
        return 'DYNASTY';
      default:
        return 'REDRAFT';
    }
  }

  private mapDraftType(type: string): DraftType {
    switch (type) {
      case 'auction':
        return 'AUCTION';
      case 'linear':
        return 'LINEAR';
      default:
        return 'SNAKE';
    }
  }

  private mapRosterSlots(positions: string[]): { position: Position; count: number }[] {
    const counts = new Map<string, number>();
    for (const pos of positions) {
      const mapped = this.mapPosition(pos);
      if (mapped) {
        counts.set(mapped, (counts.get(mapped) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([position, count]) => ({
      position: position as Position,
      count,
    }));
  }

  private mapPosition(sleeperPos: string): Position | null {
    const map: Record<string, Position> = {
      QB: 'QB',
      RB: 'RB',
      WR: 'WR',
      TE: 'TE',
      K: 'K',
      DEF: 'DEF',
      FLEX: 'FLEX',
      SUPER_FLEX: 'FLEX',
      REC_FLEX: 'FLEX',
      DL: 'DL',
      LB: 'LB',
      DB: 'DB',
    };
    return map[sleeperPos] ?? null;
  }
}
