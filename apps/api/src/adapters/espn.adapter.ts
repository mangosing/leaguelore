import type {
  NormalizedLeagueSettings,
  NormalizedManager,
  NormalizedMatchup,
  NormalizedDraft,
  NormalizedTransaction,
  NormalizedPlayer,
} from '@leaguelore/shared';
import type { PlatformAdapter, PlatformCredentials } from './types';

// ============================================================================
// ESPN Adapter — TODO: Implement
// ============================================================================
// ESPN API Notes:
//   Base URL: https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/
//   Auth: Requires cookies (espn_s2 + SWID) for private leagues
//   Docs: No official docs — reverse-engineered API
//
// Useful resources:
//   - https://github.com/cwendt94/espn-api (Python, but good API reference)
//   - https://stmorse.github.io/journal/espn-fantasy-v3.html
// ============================================================================

export class ESPNAdapter implements PlatformAdapter {
  readonly platform = 'ESPN' as const;

  async getLeagueSettings(
    _leagueId: string,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedLeagueSettings> {
    // TODO: GET /seasons/{year}/segments/0/leagues/{leagueId}?view=mSettings
    throw new Error('ESPN adapter not yet implemented');
  }

  async getManagers(
    _leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedManager[]> {
    // TODO: GET /seasons/{year}/segments/0/leagues/{leagueId}?view=mTeam
    throw new Error('ESPN adapter not yet implemented');
  }

  async getMatchups(
    _leagueId: string,
    _seasonYear: number,
    _week: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedMatchup[]> {
    // TODO: GET /seasons/{year}/segments/0/leagues/{leagueId}?view=mMatchup&scoringPeriodId={week}
    throw new Error('ESPN adapter not yet implemented');
  }

  async getDraft(
    _leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedDraft | null> {
    // TODO: GET /seasons/{year}/segments/0/leagues/{leagueId}?view=mDraftDetail
    throw new Error('ESPN adapter not yet implemented');
  }

  async getTransactions(
    _leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedTransaction[]> {
    // TODO: GET /seasons/{year}/segments/0/leagues/{leagueId}?view=mTransactions2
    throw new Error('ESPN adapter not yet implemented');
  }

  async getAllPlayers(): Promise<NormalizedPlayer[]> {
    // TODO: ESPN player endpoint with kona_player_info filter
    throw new Error('ESPN adapter not yet implemented');
  }
}
