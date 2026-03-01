import { prisma } from '../config/db';
import type { ManagerCareerStats, HeadToHeadSummary, LeagueRecord } from '@leaguelore/shared';

// ============================================================================
// Analytics Service
// ============================================================================
// Computes derived stats from raw matchup/draft/transaction data.
// Results are stored in materialized tables for fast reads.
// ============================================================================

export class AnalyticsService {
  /**
   * Compute head-to-head record between two managers across all seasons.
   *
   * TODO: Implement
   *   1. Query all matchups where both managers' teams played each other
   *   2. Count wins for each side + ties
   *   3. Upsert into HeadToHeadRecord table
   *   4. Return full H2H summary with individual matchup details
   */
  async computeHeadToHead(
    leagueId: string,
    manager1Id: string,
    manager2Id: string,
  ): Promise<HeadToHeadSummary> {
    // TODO: Implement
    throw new Error('Not yet implemented');
  }

  /**
   * Compute all-time stats for every manager in a league.
   *
   * TODO: Implement
   *   1. Aggregate Team records across all seasons per manager
   *   2. Calculate win %, avg PPG, highest/lowest week
   *   3. Calculate "luck" metric:
   *      - For each week, rank all teams by score
   *      - Calculate expected W/L as if they played every other team
   *      - Luck = actual wins - expected wins
   *   4. Upsert into ManagerAllTimeStats table
   */
  async computeAllTimeStats(leagueId: string): Promise<ManagerCareerStats[]> {
    // TODO: Implement
    throw new Error('Not yet implemented');
  }

  /**
   * Compute league records — highest score ever, biggest blowout, etc.
   *
   * TODO: Implement
   *   Records to compute:
   *   - Highest single-week score (and who/when)
   *   - Lowest single-week score
   *   - Biggest blowout (largest margin of victory)
   *   - Closest game (smallest margin)
   *   - Longest win streak
   *   - Longest losing streak
   *   - Most points in a season
   *   - Most championships
   */
  async computeLeagueRecords(leagueId: string): Promise<LeagueRecord[]> {
    // TODO: Implement
    throw new Error('Not yet implemented');
  }

  /**
   * Compute draft grades for a specific season.
   *
   * TODO: Implement
   *   1. For each draft pick, look up playerSeasonPoints
   *   2. Compare actual points vs. expected points at that draft position
   *   3. Grade A-F based on total value over/under expectation
   */
  async computeDraftGrades(leagueId: string, seasonYear: number) {
    // TODO: Implement
    throw new Error('Not yet implemented');
  }

  /**
   * Recompute all analytics for a league.
   * Called after initial sync and after each season sync.
   */
  async recomputeAll(leagueId: string): Promise<void> {
    // TODO: Get all manager pairs and compute H2H for each
    // TODO: Compute all-time stats
    // TODO: Compute league records
  }
}

export const analyticsService = new AnalyticsService();
