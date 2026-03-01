import { Queue, Worker } from 'bullmq';
import { redis } from '../config/redis';

// ============================================================================
// Job Queues
// ============================================================================

export const syncQueue = new Queue('league-sync', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const analyticsQueue = new Queue('analytics', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
  },
});

export const recapQueue = new Queue('recaps', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
  },
});

// ============================================================================
// Job Types
// ============================================================================

export interface SyncJobData {
  leagueId: string;
  platform: string;
  platformLeagueId: string;
  /** If null, sync all available seasons */
  seasonYear?: number;
  /** If true, this is the initial full sync */
  isInitialSync: boolean;
}

export interface AnalyticsJobData {
  leagueId: string;
  /** Which analytics to recompute */
  type: 'h2h' | 'all-time-stats' | 'draft-grades' | 'all';
}

export interface RecapJobData {
  leagueId: string;
  seasonYear: number;
  week: number;
}

// ============================================================================
// Workers — TODO: Implement job processors
// ============================================================================

// Uncomment and implement when ready:
//
// const syncWorker = new Worker<SyncJobData>(
//   'league-sync',
//   async (job) => {
//     // TODO: Import sync service and process
//     console.log(`Processing sync job ${job.id}`, job.data);
//   },
//   { connection: redis, concurrency: 2 }
// );
//
// const analyticsWorker = new Worker<AnalyticsJobData>(
//   'analytics',
//   async (job) => {
//     // TODO: Import analytics service and compute
//     console.log(`Processing analytics job ${job.id}`, job.data);
//   },
//   { connection: redis, concurrency: 3 }
// );
//
// const recapWorker = new Worker<RecapJobData>(
//   'recaps',
//   async (job) => {
//     // TODO: Import recap service and generate
//     console.log(`Processing recap job ${job.id}`, job.data);
//   },
//   { connection: redis, concurrency: 1 }
// );
