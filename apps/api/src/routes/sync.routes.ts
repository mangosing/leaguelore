import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

export const syncRoutes = Router();

syncRoutes.use(requireAuth);

/** Get sync status for a league */
syncRoutes.get('/:leagueId/status', async (req: AuthenticatedRequest, res) => {
  // TODO: Check BullMQ job status, return progress
  res.json({
    success: true,
    data: {
      jobId: null,
      status: 'idle',
      progress: 100,
      currentStep: 'Up to date',
    },
  });
});

/** Trigger a manual sync (commissioner or rate-limited) */
syncRoutes.post('/:leagueId/trigger', async (req: AuthenticatedRequest, res) => {
  // TODO:
  //   1. Check if a sync is already in progress
  //   2. Rate limit (max 1 manual sync per hour)
  //   3. Queue sync job
  //   4. Return job ID for status polling
  res.status(202).json({
    success: true,
    data: {
      jobId: 'TODO',
      status: 'queued',
    },
  });
});
