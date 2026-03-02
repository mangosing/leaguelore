import type { Router as RouterType } from 'express';
import { Router } from 'express';
import { analyticsRoutes } from './analytics.routes';
import { duesRoutes } from './dues.routes';
import { leagueRoutes } from './leagues.routes';
import { matchupRoutes } from './matchups.routes';
import { recapRoutes } from './recaps.routes';
import { rulesRoutes } from './rules.routes';
import { syncRoutes } from './sync.routes';
import { webhookRoutes } from './webhook.routes';

export const router: RouterType = Router();

router.use(webhookRoutes);
router.use('/leagues', leagueRoutes);
router.use('/leagues', matchupRoutes);
router.use('/leagues', analyticsRoutes);
router.use('/leagues', recapRoutes);
router.use('/leagues', rulesRoutes);
router.use('/leagues', duesRoutes);
router.use('/sync', syncRoutes);
