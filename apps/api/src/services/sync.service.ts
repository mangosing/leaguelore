import { prisma } from '../config/db';
import { getAdapter } from '../adapters/types';
import type { Platform } from '@leaguelore/shared';

// ============================================================================
// Sync Service
// ============================================================================
// Orchestrates the full sync flow: calls the adapter, maps normalized data
// to Prisma records, and writes to the database.
// ============================================================================

export class SyncService {
  /**
   * Initial sync — imports all historical data for a league.
   * Called when a commissioner first connects their league.
   *
   * Flow:
   *   1. Fetch league settings via adapter
   *   2. Create League record
   *   3. For each available season:
   *     a. Fetch + create managers and teams
   *     b. Fetch + create all weekly matchups
   *     c. Fetch + create draft data
   *     d. Fetch + create transactions
   *   4. Queue analytics computation
   */
  async initialSync(
    platform: Platform,
    platformLeagueId: string,
    userId: string,
    onProgress?: (step: string, percent: number) => void,
  ) {
    const adapter = getAdapter(platform);

    // Step 1: Fetch and validate league
    onProgress?.('Fetching league settings...', 5);
    const settings = await adapter.getLeagueSettings(platformLeagueId);

    // Step 2: Create league record
    onProgress?.('Creating league...', 10);
    const league = await prisma.league.upsert({
      where: {
        platform_platformLeagueId: {
          platform,
          platformLeagueId,
        },
      },
      update: { name: settings.name },
      create: {
        name: settings.name,
        platform,
        platformLeagueId,
        scoringType: settings.scoringType,
        leagueType: settings.leagueType,
        teamCount: settings.teamCount,
      },
    });

    // Step 3: Import each season
    const seasons = settings.availableSeasons;
    for (let i = 0; i < seasons.length; i++) {
      const year = seasons[i];
      const basePercent = 10 + ((i / seasons.length) * 80);

      onProgress?.(`Importing ${year} season...`, basePercent);

      await this.syncSeason(adapter, league.id, platformLeagueId, year, platform);
    }

    onProgress?.('Computing analytics...', 95);
    // TODO: Queue analytics job

    onProgress?.('Sync complete!', 100);

    return league;
  }

  /**
   * Sync a single season's data.
   *
   * TODO: Implement each step:
   *   - Map normalized managers to Manager + Team records
   *   - Resolve player IDs through PlayerPlatformMapping
   *   - Handle trade grouping (multiple transaction rows → one Trade record)
   *   - Determine matchup types (regular vs playoff) from league settings
   */
  private async syncSeason(
    adapter: ReturnType<typeof getAdapter>,
    leagueId: string,
    platformLeagueId: string,
    year: number,
    platform: Platform,
  ) {
    // Create season record
    const season = await prisma.season.upsert({
      where: { leagueId_year: { leagueId, year } },
      update: {},
      create: { leagueId, year },
    });

    // TODO: Fetch and store managers + teams
    // const managers = await adapter.getManagers(platformLeagueId, year);

    // TODO: Fetch and store matchups for each week
    // for (let week = 1; week <= 17; week++) {
    //   const matchups = await adapter.getMatchups(platformLeagueId, year, week);
    // }

    // TODO: Fetch and store draft
    // const draft = await adapter.getDraft(platformLeagueId, year);

    // TODO: Fetch and store transactions
    // const transactions = await adapter.getTransactions(platformLeagueId, year);

    return season;
  }

  /**
   * Incremental sync — updates just the latest week's data.
   * Called on a schedule during the active season.
   */
  async incrementalSync(leagueId: string) {
    // TODO: Implement
    //   1. Look up league + active season
    //   2. Determine current NFL week
    //   3. Fetch latest matchup scores
    //   4. Fetch recent transactions
    //   5. Update records
  }
}

export const syncService = new SyncService();
