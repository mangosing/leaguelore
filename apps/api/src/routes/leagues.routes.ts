import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

export const leagueRoutes = Router();

// All league routes require auth
leagueRoutes.use(requireAuth);

/** List user's connected leagues */
leagueRoutes.get('/', async (req: AuthenticatedRequest, res) => {
  // TODO: Implement — query leagues where user is a manager
  res.json({ success: true, data: [] });
});

/** Connect a new league */
leagueRoutes.post('/connect', async (req: AuthenticatedRequest, res) => {
  // TODO: Implement
  //   1. Validate request body (platform, platformLeagueId, auth creds)
  //   2. Use adapter to verify league exists and fetch settings
  //   3. Create League + Manager records
  //   4. Queue initial sync job
  //   5. Return league ID + sync job ID
  res.status(201).json({
    success: true,
    data: {
      leagueId: 'TODO',
      name: 'TODO',
      platform: req.body.platform,
      syncJobId: 'TODO',
    },
  });
});

/** Get league overview */
leagueRoutes.get('/:leagueId', async (req: AuthenticatedRequest, res) => {
  const { leagueId } = req.params;
  // TODO: Fetch league with season count, manager count, etc.
  res.json({ success: true, data: { id: leagueId } });
});

/** Get all seasons for a league */
leagueRoutes.get('/:leagueId/seasons', async (req: AuthenticatedRequest, res) => {
  // TODO: Query seasons for this league, ordered by year
  res.json({ success: true, data: [] });
});

/** Get all managers for a league (all-time) */
leagueRoutes.get('/:leagueId/managers', async (req: AuthenticatedRequest, res) => {
  // TODO: Query distinct managers across all seasons
  res.json({ success: true, data: [] });
});

/** Disconnect / delete a league */
leagueRoutes.delete('/:leagueId', async (req: AuthenticatedRequest, res) => {
  // TODO: Verify user is commissioner, then cascade delete
  res.json({ success: true, data: { deleted: true } });
});
