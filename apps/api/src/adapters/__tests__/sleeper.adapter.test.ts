import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SleeperAdapter } from '../sleeper.adapter';

// Import fixtures
import sleeperLeague from './fixtures/sleeper-league.json';
import sleeperMatchups from './fixtures/sleeper-matchups.json';
import sleeperDraftPicks from './fixtures/sleeper-draft-picks.json';

// ============================================================================
// Mock fetch globally for these tests
// ============================================================================

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockFetchResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  };
}

function mockFetchError(status: number) {
  return {
    ok: false,
    status,
    statusText: 'Not Found',
  };
}

describe('SleeperAdapter', () => {
  let adapter: SleeperAdapter;

  beforeEach(() => {
    adapter = new SleeperAdapter();
    mockFetch.mockReset();
  });

  // -------------------------------------------------------------------------
  // getLeagueSettings
  // -------------------------------------------------------------------------
  describe('getLeagueSettings', () => {
    it('should normalize league settings correctly', async () => {
      // First call: current league. Second call: previous league (returns no previous).
      const previousLeague = {
        ...sleeperLeague,
        league_id: '784512345678901234',
        season: '2023',
        previous_league_id: null,
      };

      mockFetch
        .mockResolvedValueOnce(mockFetchResponse(sleeperLeague))
        .mockResolvedValueOnce(mockFetchResponse(previousLeague));

      const settings = await adapter.getLeagueSettings('924039165809029120');

      expect(settings.platformLeagueId).toBe('924039165809029120');
      expect(settings.name).toBe('The Taco Bowl League');
      expect(settings.scoringType).toBe('PPR');
      expect(settings.leagueType).toBe('REDRAFT');
      expect(settings.teamCount).toBe(12);
      expect(settings.availableSeasons).toEqual([2023, 2024]);
    });

    it('should map HALF_PPR scoring correctly', async () => {
      const halfPprLeague = {
        ...sleeperLeague,
        scoring_settings: { ...sleeperLeague.scoring_settings, rec: 0.5 },
        previous_league_id: null,
      };

      mockFetch.mockResolvedValueOnce(mockFetchResponse(halfPprLeague));

      const settings = await adapter.getLeagueSettings('123');
      expect(settings.scoringType).toBe('HALF_PPR');
    });

    it('should map STANDARD scoring correctly', async () => {
      const standardLeague = {
        ...sleeperLeague,
        scoring_settings: { ...sleeperLeague.scoring_settings, rec: 0 },
        previous_league_id: null,
      };

      mockFetch.mockResolvedValueOnce(mockFetchResponse(standardLeague));

      const settings = await adapter.getLeagueSettings('123');
      expect(settings.scoringType).toBe('STANDARD');
    });

    it('should map dynasty league type correctly', async () => {
      const dynastyLeague = {
        ...sleeperLeague,
        settings: { ...sleeperLeague.settings, type: 2 },
        previous_league_id: null,
      };

      mockFetch.mockResolvedValueOnce(mockFetchResponse(dynastyLeague));

      const settings = await adapter.getLeagueSettings('123');
      expect(settings.leagueType).toBe('DYNASTY');
    });

    it('should map roster positions with correct counts', async () => {
      const league = { ...sleeperLeague, previous_league_id: null };
      mockFetch.mockResolvedValueOnce(mockFetchResponse(league));

      const settings = await adapter.getLeagueSettings('123');

      const rbSlot = settings.rosterSlots.find((s) => s.position === 'RB');
      const wrSlot = settings.rosterSlots.find((s) => s.position === 'WR');
      const qbSlot = settings.rosterSlots.find((s) => s.position === 'QB');

      expect(rbSlot?.count).toBe(2);
      expect(wrSlot?.count).toBe(2);
      expect(qbSlot?.count).toBe(1);
    });

    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchError(404));

      await expect(adapter.getLeagueSettings('nonexistent')).rejects.toThrow(
        'Sleeper API error: 404',
      );
    });
  });

  // -------------------------------------------------------------------------
  // getMatchups
  // -------------------------------------------------------------------------
  describe('getMatchups', () => {
    it('should pair matchups correctly by matchup_id', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(sleeperMatchups));

      const matchups = await adapter.getMatchups('123', 2024, 1);

      expect(matchups).toHaveLength(3); // 6 teams = 3 matchups
    });

    it('should normalize scores correctly', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(sleeperMatchups));

      const matchups = await adapter.getMatchups('123', 2024, 1);
      const firstMatchup = matchups[0];

      // matchup_id 1: roster 1 (128.42) vs roster 2 (105.78)
      expect(firstMatchup.homeTeam.score).toBe(128.42);
      expect(firstMatchup.awayTeam.score).toBe(105.78);
      expect(firstMatchup.isComplete).toBe(true);
    });

    it('should set platformTeamId as string roster_id', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse(sleeperMatchups));

      const matchups = await adapter.getMatchups('123', 2024, 1);

      expect(matchups[0].homeTeam.platformTeamId).toBe('1');
      expect(matchups[0].awayTeam.platformTeamId).toBe('2');
    });

    it('should handle empty matchups', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse([]));

      const matchups = await adapter.getMatchups('123', 2024, 1);
      expect(matchups).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // getDraft
  // -------------------------------------------------------------------------
  describe('getDraft', () => {
    it('should normalize draft picks correctly', async () => {
      const draftMeta = {
        draft_id: 'draft_001',
        type: 'snake',
        start_time: 1725217200000,
        settings: { rounds: 15 },
      };

      mockFetch
        .mockResolvedValueOnce(mockFetchResponse([draftMeta]))
        .mockResolvedValueOnce(mockFetchResponse(sleeperDraftPicks));

      const draft = await adapter.getDraft('123', 2024);

      expect(draft).not.toBeNull();
      expect(draft!.draftType).toBe('SNAKE');
      expect(draft!.rounds).toBe(15);
      expect(draft!.picks).toHaveLength(4);
    });

    it('should include auction price when present', async () => {
      const draftMeta = {
        draft_id: 'draft_001',
        type: 'auction',
        start_time: null,
        settings: { rounds: 15 },
      };

      mockFetch
        .mockResolvedValueOnce(mockFetchResponse([draftMeta]))
        .mockResolvedValueOnce(mockFetchResponse(sleeperDraftPicks));

      const draft = await adapter.getDraft('123', 2024);

      expect(draft!.draftType).toBe('AUCTION');
      // Pick 4 has an auction amount of "62"
      const pickWithAuction = draft!.picks.find((p) => p.pickNumber === 4);
      expect(pickWithAuction?.auctionPrice).toBe(62);
    });

    it('should return null when no drafts exist', async () => {
      mockFetch.mockResolvedValueOnce(mockFetchResponse([]));

      const draft = await adapter.getDraft('123', 2024);
      expect(draft).toBeNull();
    });

    it('should parse draft date from timestamp', async () => {
      const draftMeta = {
        draft_id: 'draft_001',
        type: 'snake',
        start_time: 1725217200000, // Sept 1, 2024
        settings: { rounds: 15 },
      };

      mockFetch
        .mockResolvedValueOnce(mockFetchResponse([draftMeta]))
        .mockResolvedValueOnce(mockFetchResponse([]));

      const draft = await adapter.getDraft('123', 2024);
      expect(draft!.draftDate).toBeInstanceOf(Date);
      expect(draft!.draftDate!.getFullYear()).toBe(2024);
    });
  });
});
