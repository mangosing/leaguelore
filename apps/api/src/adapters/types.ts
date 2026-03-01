import type {
  Platform,
  NormalizedLeagueSettings,
  NormalizedManager,
  NormalizedMatchup,
  NormalizedDraft,
  NormalizedTransaction,
  NormalizedPlayer,
} from '@leaguelore/shared';

// ============================================================================
// Platform Adapter Interface
// ============================================================================
// Every platform adapter MUST implement this interface.
// The sync service calls these methods — it doesn't know or care which
// platform it's talking to. All platform-specific logic lives inside
// the adapter.
// ============================================================================

export interface PlatformCredentials {
  /** ESPN requires espnS2 + SWID cookies */
  espnS2?: string;
  swid?: string;
  /** Yahoo requires OAuth tokens */
  yahooAccessToken?: string;
  yahooRefreshToken?: string;
  /** Sleeper doesn't require auth for most operations */
}

export interface PlatformAdapter {
  readonly platform: Platform;

  /**
   * Fetch league settings and available seasons.
   * This is called first when connecting a league to verify it exists.
   */
  getLeagueSettings(
    leagueId: string,
    credentials?: PlatformCredentials,
  ): Promise<NormalizedLeagueSettings>;

  /**
   * Fetch all managers/owners for a specific season.
   * Manager IDs should be consistent across seasons on the same platform.
   */
  getManagers(
    leagueId: string,
    seasonYear: number,
    credentials?: PlatformCredentials,
  ): Promise<NormalizedManager[]>;

  /**
   * Fetch all matchups for a specific week.
   * Returns normalized matchups with platform team IDs and scores.
   */
  getMatchups(
    leagueId: string,
    seasonYear: number,
    week: number,
    credentials?: PlatformCredentials,
  ): Promise<NormalizedMatchup[]>;

  /**
   * Fetch complete draft results for a season.
   * Includes pick order, player selections, and auction prices if applicable.
   */
  getDraft(
    leagueId: string,
    seasonYear: number,
    credentials?: PlatformCredentials,
  ): Promise<NormalizedDraft | null>;

  /**
   * Fetch all transactions (trades, waivers, FA adds, drops) for a season.
   * Trades should share a tradeGroupId so we can reconstruct the full trade.
   */
  getTransactions(
    leagueId: string,
    seasonYear: number,
    credentials?: PlatformCredentials,
  ): Promise<NormalizedTransaction[]>;

  /**
   * Fetch all NFL players from this platform.
   * Used for building the player ID mapping table.
   * This is expensive — call sparingly and cache aggressively.
   */
  getAllPlayers(): Promise<NormalizedPlayer[]>;
}

// ============================================================================
// Adapter Factory
// ============================================================================

import { SleeperAdapter } from './sleeper.adapter';
// import { ESPNAdapter } from './espn.adapter';
// import { YahooAdapter } from './yahoo.adapter';

const adapters: Record<Platform, PlatformAdapter> = {
  SLEEPER: new SleeperAdapter(),
  // ESPN: new ESPNAdapter(),
  // YAHOO: new YahooAdapter(),
  ESPN: null as unknown as PlatformAdapter, // TODO: Implement
  YAHOO: null as unknown as PlatformAdapter, // TODO: Implement
};

export function getAdapter(platform: Platform): PlatformAdapter {
  const adapter = adapters[platform];
  if (!adapter) {
    throw new Error(`Adapter for platform "${platform}" is not yet implemented`);
  }
  return adapter;
}
