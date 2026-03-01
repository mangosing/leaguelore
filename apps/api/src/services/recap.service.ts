import { prisma } from '../config/db';

// ============================================================================
// Recap Service
// ============================================================================
// Generates AI-powered weekly recaps using Claude.
// ============================================================================

export class RecapService {
  /**
   * Generate a weekly recap for a specific week.
   *
   * TODO: Implement
   *   1. Fetch all matchups for the week with team/manager names
   *   2. Compute highlights:
   *      - Biggest blowout
   *      - Closest game
   *      - Highest scorer
   *      - Biggest underperformer
   *      - Lucky winner (won with lowest score)
   *   3. Build prompt with league context
   *   4. Call Claude API
   *   5. Parse and store recap
   *
   * Prompt template should include:
   *   - League name and personality
   *   - All matchup results
   *   - Notable stats
   *   - Request for: headline, recap body, manager of the week, clown of the week
   */
  async generateRecap(leagueId: string, seasonYear: number, week: number) {
    // Step 1: Fetch matchup data
    const matchups = await prisma.matchup.findMany({
      where: {
        season: { leagueId, year: seasonYear },
        week,
        isComplete: true,
      },
      include: {
        homeTeam: { include: { manager: true } },
        awayTeam: { include: { manager: true } },
      },
    });

    if (matchups.length === 0) {
      throw new Error(`No completed matchups found for week ${week}`);
    }

    // Step 2: Compute highlights
    // TODO: Find biggest blowout, closest game, highest/lowest scorer

    // Step 3: Build prompt
    // TODO: Construct prompt with matchup data + highlights

    // Step 4: Call Claude API
    // TODO:
    // const response = await fetch('https://api.anthropic.com/v1/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-api-key': env.ANTHROPIC_API_KEY,
    //     'anthropic-version': '2023-06-01',
    //   },
    //   body: JSON.stringify({
    //     model: 'claude-sonnet-4-20250514',
    //     max_tokens: 1024,
    //     messages: [{ role: 'user', content: prompt }],
    //   }),
    // });

    // Step 5: Save recap
    // TODO: Upsert into WeeklyRecap table

    throw new Error('Not yet implemented');
  }
}

export const recapService = new RecapService();
