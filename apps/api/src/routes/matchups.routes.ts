import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

export const matchupRoutes = Router();

matchupRoutes.use(requireAuth);

/** Get all matchups for a season */
matchupRoutes.get('/:leagueId/seasons/:year/matchups', async (req: AuthenticatedRequest, res) => {
  // TODO: Query matchups for this season, include team names and scores
  res.json({ success: true, data: [] });
});

/** Get matchups for a specific week */
matchupRoutes.get(
  '/:leagueId/seasons/:year/matchups/:week',
  async (req: AuthenticatedRequest, res) => {
    // TODO: Query matchups for specific week
    res.json({ success: true, data: [] });
  },
);

/** Get draft results for a season */
matchupRoutes.get('/:leagueId/seasons/:year/draft', async (req: AuthenticatedRequest, res) => {
  // TODO: Return draft with picks, player names, and team assignments
  res.json({ success: true, data: null });
});

/** Get season standings */
matchupRoutes.get(
  '/:leagueId/seasons/:year/standings',
  async (req: AuthenticatedRequest, res) => {
    // TODO: Return teams ordered by record, then points for
    res.json({ success: true, data: [] });
  },
);

/** Get transactions for a season */
matchupRoutes.get(
  '/:leagueId/seasons/:year/transactions',
  async (req: AuthenticatedRequest, res) => {
    // TODO: Return trades + roster moves, ordered by date
    res.json({ success: true, data: [] });
  },
);
