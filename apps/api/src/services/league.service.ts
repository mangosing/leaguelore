import { prisma } from '../config/db';
import type { LeagueOverview } from '@leaguelore/shared';

// ============================================================================
// League Service
// ============================================================================

export class LeagueService {
  /** Get all leagues for a user */
  async getLeaguesForUser(userId: string): Promise<LeagueOverview[]> {
    const managers = await prisma.manager.findMany({
      where: { userId },
      include: {
        league: {
          include: {
            seasons: { orderBy: { year: 'desc' }, take: 1 },
            _count: { select: { managers: true, seasons: true } },
          },
        },
      },
    });

    return managers.map((m) => ({
      id: m.league.id,
      name: m.league.name,
      platform: m.league.platform,
      scoringType: m.league.scoringType,
      leagueType: m.league.leagueType,
      teamCount: m.league.teamCount,
      seasonsCount: m.league._count.seasons,
      activeSeason: m.league.seasons[0]?.year ?? null,
      managerCount: m.league._count.managers,
    }));
  }

  /** Get league overview by ID */
  async getLeagueById(leagueId: string): Promise<LeagueOverview | null> {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        seasons: { orderBy: { year: 'desc' }, take: 1 },
        _count: { select: { managers: true, seasons: true } },
      },
    });

    if (!league) return null;

    return {
      id: league.id,
      name: league.name,
      platform: league.platform,
      scoringType: league.scoringType,
      leagueType: league.leagueType,
      teamCount: league.teamCount,
      seasonsCount: league._count.seasons,
      activeSeason: league.seasons[0]?.year ?? null,
      managerCount: league._count.managers,
    };
  }

  /** Verify a user is a member of a league */
  async isLeagueMember(leagueId: string, userId: string): Promise<boolean> {
    const manager = await prisma.manager.findFirst({
      where: { leagueId, userId },
    });
    return !!manager;
  }

  /** Verify a user is commissioner of a league */
  async isCommissioner(leagueId: string, userId: string): Promise<boolean> {
    const manager = await prisma.manager.findFirst({
      where: { leagueId, userId, isCommissioner: true },
    });
    return !!manager;
  }
}

export const leagueService = new LeagueService();
