import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

export const rulesRoutes = Router();

rulesRoutes.use(requireAuth);

/** Get all rules for a league */
rulesRoutes.get('/:leagueId/rules', async (req: AuthenticatedRequest, res) => {
  // TODO: Return rules grouped by category, with vote counts
  res.json({ success: true, data: [] });
});

/** Add a new rule (commissioner only) */
rulesRoutes.post('/:leagueId/rules', async (req: AuthenticatedRequest, res) => {
  // TODO: Validate body, verify commissioner, create rule
  res.status(201).json({ success: true, data: null });
});

/** Update a rule (commissioner only) */
rulesRoutes.put('/:leagueId/rules/:ruleId', async (req: AuthenticatedRequest, res) => {
  // TODO: Validate body, verify commissioner, update rule
  res.json({ success: true, data: null });
});

/** Vote on a rule (any league member) */
rulesRoutes.post('/:leagueId/rules/:ruleId/vote', async (req: AuthenticatedRequest, res) => {
  // TODO: Validate vote, verify league membership, upsert vote
  res.json({ success: true, data: null });
});

/** Delete a rule (commissioner only) */
rulesRoutes.delete('/:leagueId/rules/:ruleId', async (req: AuthenticatedRequest, res) => {
  // TODO: Verify commissioner, delete rule + votes
  res.json({ success: true, data: { deleted: true } });
});
