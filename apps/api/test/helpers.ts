import type {
  NormalizedMatchup,
  NormalizedManager,
  NormalizedDraft,
  NormalizedDraftPick,
  NormalizedLeagueSettings,
} from '@leaguelore/shared';

/**
 * Factory functions for creating test data.
 * Use these instead of manually constructing objects in every test.
 */

export function createMockLeagueSettings(
  overrides: Partial<NormalizedLeagueSettings> = {},
): NormalizedLeagueSettings {
  return {
    platformLeagueId: '123456789',
    name: 'Test League',
    scoringType: 'PPR',
    leagueType: 'REDRAFT',
    teamCount: 12,
    availableSeasons: [2023, 2024],
    rosterSlots: [
      { position: 'QB', count: 1 },
      { position: 'RB', count: 2 },
      { position: 'WR', count: 2 },
      { position: 'TE', count: 1 },
      { position: 'FLEX', count: 1 },
      { position: 'K', count: 1 },
      { position: 'DEF', count: 1 },
    ],
    ...overrides,
  };
}

export function createMockManager(
  overrides: Partial<NormalizedManager> = {},
): NormalizedManager {
  return {
    platformManagerId: 'mgr_001',
    displayName: 'Test Manager',
    teamName: 'Test Team',
    platformTeamId: 'team_001',
    isCommissioner: false,
    ...overrides,
  };
}

export function createMockMatchup(overrides: Partial<NormalizedMatchup> = {}): NormalizedMatchup {
  return {
    week: 1,
    matchupType: 'REGULAR',
    homeTeam: {
      platformTeamId: 'team_001',
      score: 120.5,
    },
    awayTeam: {
      platformTeamId: 'team_002',
      score: 98.3,
    },
    isComplete: true,
    ...overrides,
  };
}

export function createMockDraft(overrides: Partial<NormalizedDraft> = {}): NormalizedDraft {
  return {
    draftType: 'SNAKE',
    draftDate: new Date('2024-09-01T18:00:00Z'),
    rounds: 15,
    picks: Array.from({ length: 12 }, (_, i) => createMockDraftPick({ pickNumber: i + 1 })),
    ...overrides,
  };
}

export function createMockDraftPick(
  overrides: Partial<NormalizedDraftPick> = {},
): NormalizedDraftPick {
  return {
    round: 1,
    pickNumber: 1,
    pickInRound: 1,
    platformTeamId: 'team_001',
    platformPlayerId: 'player_001',
    ...overrides,
  };
}

/**
 * Generate a full season of matchups for a 12-team league.
 * Useful for testing analytics computations.
 */
export function createMockSeason(
  teamIds: string[],
  weeks: number = 14,
): NormalizedMatchup[] {
  const matchups: NormalizedMatchup[] = [];

  for (let week = 1; week <= weeks; week++) {
    // Pair teams up (simple round-robin approximation)
    for (let i = 0; i < teamIds.length; i += 2) {
      matchups.push(
        createMockMatchup({
          week,
          homeTeam: {
            platformTeamId: teamIds[i],
            score: Math.round((80 + Math.random() * 80) * 10) / 10,
          },
          awayTeam: {
            platformTeamId: teamIds[i + 1],
            score: Math.round((80 + Math.random() * 80) * 10) / 10,
          },
        }),
      );
    }
  }

  return matchups;
}
