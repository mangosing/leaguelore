import { Router } from 'express';
import { leagueRoutes } from './leagues.routes';
import { matchupRoutes } from './matchups.routes';
import { analyticsRoutes } from './analytics.routes';
import { recapRoutes } from './recaps.routes';
import { rulesRoutes } from './rules.routes';
import { duesRoutes } from './dues.routes';
import { syncRoutes } from './sync.routes';

export const router = Router();

router.use('/leagues', leagueRoutes);
router.use('/leagues', matchupRoutes);
router.use('/leagues', analyticsRoutes);
router.use('/leagues', recapRoutes);
router.use('/leagues', rulesRoutes);
router.use('/leagues', duesRoutes);
router.use('/sync', syncRoutes);
