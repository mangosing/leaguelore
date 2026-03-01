import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

export const duesRoutes = Router();

duesRoutes.use(requireAuth);

/** Get dues status for a season */
duesRoutes.get('/:leagueId/dues/:year', async (req: AuthenticatedRequest, res) => {
  // TODO: Return all manager dues with status for this season
  res.json({ success: true, data: [] });
});

/** Set dues for a season (commissioner only) */
duesRoutes.post('/:leagueId/dues/:year', async (req: AuthenticatedRequest, res) => {
  // TODO:
  //   1. Verify commissioner
  //   2. Create LeagueDues records for specified managers
  //   3. Optionally send reminder emails
  res.status(201).json({ success: true, data: null });
});

/** Update a due status — mark as paid, waived, etc. (commissioner only) */
duesRoutes.patch('/:leagueId/dues/:dueId', async (req: AuthenticatedRequest, res) => {
  // TODO: Verify commissioner, update due status + paidAt timestamp
  res.json({ success: true, data: null });
});

/** Send reminder for unpaid dues (commissioner only) */
duesRoutes.post('/:leagueId/dues/:year/remind', async (req: AuthenticatedRequest, res) => {
  // TODO: Queue reminder emails/notifications for unpaid managers
  res.json({ success: true, data: { sent: true } });
});
