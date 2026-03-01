// ============================================================================
// API Request / Response Types
// ============================================================================

import type { Platform } from './league.types';

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// --- League Routes ---

export interface ConnectLeagueRequest {
  platform: Platform;
  platformLeagueId: string;
  /** ESPN requires auth cookies */
  espnAuth?: {
    espnS2: string;
    swid: string;
  };
}

export interface ConnectLeagueResponse {
  leagueId: string;
  name: string;
  platform: Platform;
  syncJobId: string; // So frontend can poll sync progress
}

export interface SyncStatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string; // "Importing 2022 season..."
  error?: string;
}

export interface LeagueOverview {
  id: string;
  name: string;
  platform: Platform;
  scoringType: string;
  leagueType: string;
  teamCount: number;
  seasonsCount: number;
  activeSeason: number | null;
  managerCount: number;
}

// --- Dues Routes ---

export interface SetDuesRequest {
  amount: number;
  managerIds: string[]; // Which managers owe dues
}

export interface UpdateDueRequest {
  status: 'PAID' | 'WAIVED' | 'PARTIAL';
}

// --- Rules Routes ---

export interface CreateRuleRequest {
  title: string;
  description: string;
  category?: string;
}

export interface VoteOnRuleRequest {
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
}

// --- Recap Routes ---

export interface GenerateRecapRequest {
  seasonYear: number;
  week: number;
}
