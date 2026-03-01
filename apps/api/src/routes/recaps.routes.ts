import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

export const recapRoutes = Router();

recapRoutes.use(requireAuth);

/** List all recaps for a league */
recapRoutes.get('/:leagueId/recaps', async (req: AuthenticatedRequest, res) => {
  // TODO: Return all weekly recaps, newest first
  res.json({ success: true, data: [] });
});

/** Get a specific weekly recap */
recapRoutes.get('/:leagueId/recaps/:year/:week', async (req: AuthenticatedRequest, res) => {
  // TODO: Return specific recap content
  res.json({ success: true, data: null });
});

/** Trigger recap generation for a week (commissioner only) */
recapRoutes.post('/:leagueId/recaps/:year/:week/generate', async (req: AuthenticatedRequest, res) => {
  // TODO:
  //   1. Verify user is commissioner
  //   2. Fetch matchup data for that week
  //   3. Build prompt with matchup context
  //   4. Call Claude API
  //   5. Save recap to DB
  //   6. Return generated recap
  res.status(201).json({ success: true, data: null });
});
