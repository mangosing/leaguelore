-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ESPN', 'YAHOO', 'SLEEPER');

-- CreateEnum
CREATE TYPE "ScoringType" AS ENUM ('STANDARD', 'HALF_PPR', 'PPR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LeagueType" AS ENUM ('REDRAFT', 'KEEPER', 'DYNASTY');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DL', 'LB', 'DB', 'FLEX');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'INJURED_RESERVE', 'OUT', 'DOUBTFUL', 'QUESTIONABLE', 'SUSPENDED', 'FREE_AGENT', 'RETIRED');

-- CreateEnum
CREATE TYPE "MatchupType" AS ENUM ('REGULAR', 'PLAYOFF', 'CONSOLATION', 'CHAMPIONSHIP', 'TOILET_BOWL');

-- CreateEnum
CREATE TYPE "DraftType" AS ENUM ('SNAKE', 'AUCTION', 'LINEAR');

-- CreateEnum
CREATE TYPE "TradeDirection" AS ENUM ('TO_INITIATOR', 'TO_RECEIVER');

-- CreateEnum
CREATE TYPE "TradeAssetType" AS ENUM ('PLAYER', 'DRAFT_PICK');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'COMPLETED', 'VETOED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RosterMoveType" AS ENUM ('WAIVER_ADD', 'FREE_AGENT_ADD', 'DROP', 'IR_MOVE');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('FOR', 'AGAINST', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "DuesStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('FREE', 'ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "clerkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformLeagueId" TEXT NOT NULL,
    "scoringType" "ScoringType" NOT NULL DEFAULT 'PPR',
    "leagueType" "LeagueType" NOT NULL DEFAULT 'REDRAFT',
    "teamCount" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "totalWeeks" INTEGER NOT NULL DEFAULT 17,
    "playoffWeeks" INTEGER NOT NULL DEFAULT 3,
    "championTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "leagueId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "platformManagerId" TEXT,
    "isCommissioner" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "platformTeamId" TEXT,
    "finalStanding" INTEGER,
    "isPlayoffTeam" BOOLEAN NOT NULL DEFAULT false,
    "isChampion" BOOLEAN NOT NULL DEFAULT false,
    "regularSeasonW" INTEGER NOT NULL DEFAULT 0,
    "regularSeasonL" INTEGER NOT NULL DEFAULT 0,
    "regularSeasonT" INTEGER NOT NULL DEFAULT 0,
    "pointsFor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointsAgainst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "position" "Position" NOT NULL,
    "nflTeam" TEXT,
    "status" "PlayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "headshotUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPlatformMapping" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformPlayerId" TEXT NOT NULL,

    CONSTRAINT "PlayerPlatformMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlayerScore" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "leagueId" TEXT NOT NULL,

    CONSTRAINT "WeeklyPlayerScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matchup" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "matchupType" "MatchupType" NOT NULL DEFAULT 'REGULAR',
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" DOUBLE PRECISION,
    "awayScore" DOUBLE PRECISION,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "draftType" "DraftType" NOT NULL DEFAULT 'SNAKE',
    "draftDate" TIMESTAMP(3),
    "rounds" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftPick" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "pickNumber" INTEGER NOT NULL,
    "pickInRound" INTEGER NOT NULL,
    "playerSeasonPoints" DOUBLE PRECISION,
    "adpAtDraft" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DraftPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "initiatorTeamId" TEXT NOT NULL,
    "receiverTeamId" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'COMPLETED',
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeAsset" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "playerId" TEXT,
    "direction" "TradeDirection" NOT NULL,
    "assetType" "TradeAssetType" NOT NULL DEFAULT 'PLAYER',
    "draftPickRound" INTEGER,
    "draftPickYear" INTEGER,

    CONSTRAINT "TradeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterMove" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "moveType" "RosterMoveType" NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "faabBid" INTEGER,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RosterMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueRule" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleVote" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "vote" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueDues" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "DuesStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueDues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyRecap" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "highlights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyRecap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeadToHeadRecord" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "manager1Id" TEXT NOT NULL,
    "manager2Id" TEXT NOT NULL,
    "manager1Wins" INTEGER NOT NULL DEFAULT 0,
    "manager2Wins" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeadToHeadRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerAllTimeStats" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "totalTies" INTEGER NOT NULL DEFAULT 0,
    "totalPointsFor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPointsAgainst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "championships" INTEGER NOT NULL DEFAULT 0,
    "playoffAppearances" INTEGER NOT NULL DEFAULT 0,
    "seasonsPlayed" INTEGER NOT NULL DEFAULT 0,
    "highestWeekScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowestWeekScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPointsPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedWins" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedLosses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerAllTimeStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'FREE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformLink_userId_platform_key" ON "PlatformLink"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformLink_platform_platformUserId_key" ON "PlatformLink"("platform", "platformUserId");

-- CreateIndex
CREATE INDEX "League_platform_platformLeagueId_idx" ON "League"("platform", "platformLeagueId");

-- CreateIndex
CREATE UNIQUE INDEX "League_platform_platformLeagueId_key" ON "League"("platform", "platformLeagueId");

-- CreateIndex
CREATE INDEX "Season_leagueId_year_idx" ON "Season"("leagueId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Season_leagueId_year_key" ON "Season"("leagueId", "year");

-- CreateIndex
CREATE INDEX "Manager_leagueId_idx" ON "Manager"("leagueId");

-- CreateIndex
CREATE INDEX "Manager_userId_idx" ON "Manager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_leagueId_platformManagerId_key" ON "Manager"("leagueId", "platformManagerId");

-- CreateIndex
CREATE INDEX "Team_seasonId_idx" ON "Team"("seasonId");

-- CreateIndex
CREATE INDEX "Team_managerId_idx" ON "Team"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_managerId_seasonId_key" ON "Team"("managerId", "seasonId");

-- CreateIndex
CREATE INDEX "PlayerPlatformMapping_platform_platformPlayerId_idx" ON "PlayerPlatformMapping"("platform", "platformPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerPlatformMapping_platform_platformPlayerId_key" ON "PlayerPlatformMapping"("platform", "platformPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerPlatformMapping_playerId_platform_key" ON "PlayerPlatformMapping"("playerId", "platform");

-- CreateIndex
CREATE INDEX "WeeklyPlayerScore_playerId_seasonYear_week_idx" ON "WeeklyPlayerScore"("playerId", "seasonYear", "week");

-- CreateIndex
CREATE INDEX "WeeklyPlayerScore_leagueId_seasonYear_week_idx" ON "WeeklyPlayerScore"("leagueId", "seasonYear", "week");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlayerScore_playerId_leagueId_seasonYear_week_key" ON "WeeklyPlayerScore"("playerId", "leagueId", "seasonYear", "week");

-- CreateIndex
CREATE INDEX "Matchup_seasonId_week_idx" ON "Matchup"("seasonId", "week");

-- CreateIndex
CREATE UNIQUE INDEX "Matchup_seasonId_week_homeTeamId_key" ON "Matchup"("seasonId", "week", "homeTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_seasonId_key" ON "Draft"("seasonId");

-- CreateIndex
CREATE INDEX "DraftPick_draftId_idx" ON "DraftPick"("draftId");

-- CreateIndex
CREATE INDEX "DraftPick_teamId_idx" ON "DraftPick"("teamId");

-- CreateIndex
CREATE INDEX "DraftPick_playerId_idx" ON "DraftPick"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_draftId_pickNumber_key" ON "DraftPick"("draftId", "pickNumber");

-- CreateIndex
CREATE INDEX "Trade_initiatorTeamId_idx" ON "Trade"("initiatorTeamId");

-- CreateIndex
CREATE INDEX "Trade_receiverTeamId_idx" ON "Trade"("receiverTeamId");

-- CreateIndex
CREATE INDEX "TradeAsset_tradeId_idx" ON "TradeAsset"("tradeId");

-- CreateIndex
CREATE INDEX "RosterMove_teamId_seasonYear_idx" ON "RosterMove"("teamId", "seasonYear");

-- CreateIndex
CREATE INDEX "RosterMove_playerId_idx" ON "RosterMove"("playerId");

-- CreateIndex
CREATE INDEX "LeagueRule_leagueId_idx" ON "LeagueRule"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "RuleVote_ruleId_managerId_key" ON "RuleVote"("ruleId", "managerId");

-- CreateIndex
CREATE INDEX "LeagueDues_leagueId_seasonYear_idx" ON "LeagueDues"("leagueId", "seasonYear");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueDues_leagueId_managerId_seasonYear_key" ON "LeagueDues"("leagueId", "managerId", "seasonYear");

-- CreateIndex
CREATE INDEX "WeeklyRecap_leagueId_seasonYear_idx" ON "WeeklyRecap"("leagueId", "seasonYear");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyRecap_leagueId_seasonYear_week_key" ON "WeeklyRecap"("leagueId", "seasonYear", "week");

-- CreateIndex
CREATE INDEX "HeadToHeadRecord_leagueId_idx" ON "HeadToHeadRecord"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "HeadToHeadRecord_leagueId_manager1Id_manager2Id_key" ON "HeadToHeadRecord"("leagueId", "manager1Id", "manager2Id");

-- CreateIndex
CREATE INDEX "ManagerAllTimeStats_leagueId_idx" ON "ManagerAllTimeStats"("leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerAllTimeStats_leagueId_managerId_key" ON "ManagerAllTimeStats"("leagueId", "managerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "PlatformLink" ADD CONSTRAINT "PlatformLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPlatformMapping" ADD CONSTRAINT "PlayerPlatformMapping_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlayerScore" ADD CONSTRAINT "WeeklyPlayerScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchup" ADD CONSTRAINT "Matchup_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchup" ADD CONSTRAINT "Matchup_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchup" ADD CONSTRAINT "Matchup_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_initiatorTeamId_fkey" FOREIGN KEY ("initiatorTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_receiverTeamId_fkey" FOREIGN KEY ("receiverTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeAsset" ADD CONSTRAINT "TradeAsset_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeAsset" ADD CONSTRAINT "TradeAsset_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterMove" ADD CONSTRAINT "RosterMove_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterMove" ADD CONSTRAINT "RosterMove_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueRule" ADD CONSTRAINT "LeagueRule_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleVote" ADD CONSTRAINT "RuleVote_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "LeagueRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueDues" ADD CONSTRAINT "LeagueDues_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueDues" ADD CONSTRAINT "LeagueDues_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyRecap" ADD CONSTRAINT "WeeklyRecap_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
