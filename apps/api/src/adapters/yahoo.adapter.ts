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
// Yahoo Adapter — TODO: Implement
// ============================================================================
// Yahoo Fantasy API Notes:
//   Base URL: https://fantasysports.yahooapis.com/fantasy/v2/
//   Auth: OAuth 2.0 — user must authorize via Yahoo login
//   Docs: https://developer.yahoo.com/fantasysports/guide/
//
// Key concepts:
//   - league_key format: "nfl.l.{league_id}"
//   - team_key format: "nfl.l.{league_id}.t.{team_id}"
//   - Supports XML and JSON (add ?format=json)
//   - Rate limits are stricter than Sleeper
// ============================================================================

export class YahooAdapter implements PlatformAdapter {
  readonly platform = 'YAHOO' as const;

  async getLeagueSettings(
    _leagueId: string,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedLeagueSettings> {
    // TODO: GET /league/nfl.l.{id}/settings?format=json
    throw new Error('Yahoo adapter not yet implemented');
  }

  async getManagers(
    _leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedManager[]> {
    // TODO: GET /league/nfl.l.{id}/teams?format=json
    throw new Error('Yahoo adapter not yet implemented');
  }

  async getMatchups(
    _leagueId: string,
    _seasonYear: number,
    _week: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedMatchup[]> {
    // TODO: GET /league/nfl.l.{id}/scoreboard;week={week}?format=json
    throw new Error('Yahoo adapter not yet implemented');
  }

  async getDraft(
    _leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedDraft | null> {
    // TODO: GET /league/nfl.l.{id}/draftresults?format=json
    throw new Error('Yahoo adapter not yet implemented');
  }

  async getTransactions(
    _leagueId: string,
    _seasonYear: number,
    _credentials?: PlatformCredentials,
  ): Promise<NormalizedTransaction[]> {
    // TODO: GET /league/nfl.l.{id}/transactions?format=json
    throw new Error('Yahoo adapter not yet implemented');
  }

  async getAllPlayers(): Promise<NormalizedPlayer[]> {
    // TODO: Yahoo player search endpoint (paginated, 25 at a time)
    throw new Error('Yahoo adapter not yet implemented');
  }
}
