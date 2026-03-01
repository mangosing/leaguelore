# LeagueLore — Technical Architecture

## Overview

LeagueLore is a fantasy football league companion platform that ingests data from
ESPN, Yahoo, and Sleeper, normalizes it into a unified schema, and surfaces
historical analytics, commissioner tools, and AI-powered recaps.

---

## Tech Stack

| Layer        | Technology              | Rationale                                    |
|--------------|-------------------------|----------------------------------------------|
| Frontend     | Next.js 14 + TypeScript | SSR for SEO, app router, React Server Comps  |
| API          | Express + TypeScript    | Full control, middleware, background jobs     |
| Database     | PostgreSQL              | Relational data (managers, matchups, seasons) |
| ORM          | Prisma                  | Type-safe queries, clean migrations           |
| Cache        | Redis                   | Cache platform API responses (rate limits)    |
| Auth         | Clerk                   | Drop-in auth, OAuth, user management          |
| Payments     | Stripe                  | Subscriptions + one-time league payments      |
| AI           | Claude API              | Weekly recap generation, trade analysis       |
| Deployment   | Railway or Fly.io       | Easy Postgres + Redis + Node hosting          |
| Container    | Docker                  | Local dev parity, easy deployment             |

---

## Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      NEXT.JS FRONTEND                   │
│   Dashboard │ League History │ Commissioner Tools        │
└──────────────────────┬──────────────────────────────────┘
                       │ REST / tRPC
┌──────────────────────▼──────────────────────────────────┐
│                    EXPRESS API SERVER                     │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Routes   │  │  Services    │  │  Background Jobs  │  │
│  │          │  │              │  │                   │  │
│  │ /leagues │  │ LeagueSync   │  │ SyncScheduler     │  │
│  │ /matchups│  │ Analytics    │  │ RecapGenerator    │  │
│  │ /draft   │  │ TradeAnalysis│  │ StatsComputer     │  │
│  │ /recap   │  │ DuesTracker  │  │ DuesReminder      │  │
│  └──────────┘  └──────┬───────┘  └───────────────────┘  │
│                       │                                  │
│              ┌────────▼─────────┐                        │
│              │ PLATFORM ADAPTER │                        │
│              │     LAYER        │                        │
│              ├──────────────────┤                        │
│              │ ESPNAdapter      │                        │
│              │ YahooAdapter     │                        │
│              │ SleeperAdapter   │                        │
│              └────────┬─────────┘                        │
└───────────────────────┼──────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   ESPN   │  │  Yahoo   │  │ Sleeper  │
    │   API    │  │   API    │  │   API    │
    └──────────┘  └──────────┘  └──────────┘
```

---

## Platform Adapter Pattern

This is the most critical piece of the system. Each platform returns data in
completely different shapes. The adapter layer normalizes everything into our
unified schema before it touches the database.

### Interface Contract

Every platform adapter implements the same interface:

```typescript
interface PlatformAdapter {
  platform: Platform;

  // Auth & Connection
  authenticate(credentials: PlatformCredentials): Promise<void>;

  // League Discovery
  getLeagues(userId: string): Promise<RawLeague[]>;

  // Data Extraction (all return normalized shapes)
  getLeagueSettings(leagueId: string): Promise<NormalizedLeagueSettings>;
  getManagers(leagueId: string, seasonYear: number): Promise<NormalizedManager[]>;
  getMatchups(leagueId: string, seasonYear: number, week: number): Promise<NormalizedMatchup[]>;
  getDraft(leagueId: string, seasonYear: number): Promise<NormalizedDraft>;
  getRoster(leagueId: string, teamId: string, week: number): Promise<NormalizedRoster>;
  getTransactions(leagueId: string, seasonYear: number): Promise<NormalizedTransaction[]>;

  // Player ID Resolution
  resolvePlayerId(platformPlayerId: string): Promise<string>; // Returns canonical player ID
}
```

### Normalized Types

```typescript
// What every adapter returns — platform differences are abstracted away
interface NormalizedMatchup {
  week: number;
  matchupType: 'REGULAR' | 'PLAYOFF' | 'CONSOLATION' | 'CHAMPIONSHIP';
  homeTeam: {
    platformTeamId: string;
    score: number | null;
    roster?: NormalizedRosterSlot[];
  };
  awayTeam: {
    platformTeamId: string;
    score: number | null;
    roster?: NormalizedRosterSlot[];
  };
  isComplete: boolean;
}

interface NormalizedManager {
  platformManagerId: string;
  displayName: string;
  teamName: string;
  platformTeamId: string;
  isCommissioner: boolean;
}

interface NormalizedDraft {
  draftType: 'SNAKE' | 'AUCTION' | 'LINEAR';
  draftDate: Date | null;
  rounds: number;
  picks: NormalizedDraftPick[];
}

interface NormalizedDraftPick {
  round: number;
  pickNumber: number;
  pickInRound: number;
  platformTeamId: string;
  platformPlayerId: string;
  auctionPrice?: number; // For auction drafts
}

interface NormalizedTransaction {
  type: 'WAIVER_ADD' | 'FREE_AGENT_ADD' | 'DROP' | 'TRADE';
  week: number;
  timestamp: Date;
  platformTeamId: string;
  platformPlayerId: string;
  faabBid?: number;
  // For trades, multiple transactions will share a tradeGroupId
  tradeGroupId?: string;
}
```

### Platform-Specific Notes

**ESPN**
- API: Semi-public, no official docs. Uses `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/`
- Auth: ESPN uses cookies (`espn_s2` + `SWID`) for private leagues — user provides these
- Historical data: Available going back many years for established leagues
- Quirk: Player IDs are numeric, positions encoded as integers
- Rate limits: Moderate, cache aggressively

**Yahoo**
- API: Official OAuth2 API at `https://fantasysports.yahooapis.com/fantasy/v2/`
- Auth: Full OAuth2 flow — user connects via Yahoo login
- Historical data: Excellent, well-structured XML/JSON responses
- Quirk: Uses `league_key` format like `nfl.l.123456`
- Rate limits: Stricter, needs careful caching

**Sleeper**
- API: Public REST API at `https://api.sleeper.app/v1/`
- Auth: No auth needed for public leagues (most are public)
- Historical data: Limited to seasons the league has existed on Sleeper
- Quirk: Player IDs are their own system, need mapping to ESPN/Yahoo
- Rate limits: Generous, but be respectful

---

## Player ID Resolution

The hardest normalization problem. The same NFL player has different IDs on every
platform. Our approach:

1. **Seed a canonical player table** from a source like `sleeper.app/v1/players/nfl`
   (most comprehensive free source)
2. **Store platform mappings** in `PlayerPlatformMapping` table
3. **On first sync**, match players by name + position + team
4. **Build a mapping cache** in Redis so subsequent lookups are instant
5. **Handle edge cases** (traded players, name changes, rookies) via fuzzy matching
   with manual override capability

```
Canonical Player: { id: "plyr_abc", name: "Brock Purdy", position: "QB", team: "SF" }
├── ESPN Mapping:    { platformPlayerId: "4361741" }
├── Yahoo Mapping:   { platformPlayerId: "nfl.p.40026" }
└── Sleeper Mapping: { platformPlayerId: "9509" }
```

---

## Sync Strategy

### Initial Sync (League Connection)
When a commissioner first connects their league:

1. Fetch league settings → create `League` record
2. Fetch all available historical seasons (loop backward)
3. For each season:
   a. Fetch managers/teams → create `Manager` + `Team` records
   b. Fetch all weekly matchups → create `Matchup` records
   c. Fetch draft data → create `Draft` + `DraftPick` records
   d. Fetch transactions → create `Trade` + `RosterMove` records
4. Compute analytics → populate `HeadToHeadRecord` + `ManagerAllTimeStats`

This is the heaviest operation. Queue it as a background job with progress tracking.
Show the user a progress bar: "Importing 2019... 2020... 2021..."

### Ongoing Sync (During Season)
- **Hourly**: Check for new matchup scores, roster moves
- **Post-game (Tuesday AM)**: Full weekly sync — final scores, transactions
- **Wednesday**: Generate AI weekly recap

### Caching Strategy
```
Redis Keys:
  platform:{espn|yahoo|sleeper}:league:{id}:settings  → TTL 24h
  platform:{espn|yahoo|sleeper}:league:{id}:week:{n}  → TTL 1h (active), forever (past)
  player:mapping:{platform}:{platformId}               → TTL 7d
  analytics:h2h:{leagueId}:{mgr1}:{mgr2}              → Recompute on new matchup
```

---

## Analytics Engine

### Computed on Sync (Background Jobs)

**Head-to-Head Records**
For every pair of managers in a league, compute all-time record from matchup history.
Store in `HeadToHeadRecord` table. Recompute incrementally when new matchups sync.

**Manager All-Time Stats**
Aggregated from `Team` records across seasons. Includes:
- Win/loss/tie totals
- Points for/against
- Championship count
- Playoff appearances
- Highest/lowest weekly scores
- "Luck" metric (actual wins vs. expected wins based on weekly scoring rank)

**Draft Analysis**
For each draft pick, compare:
- Where they were drafted (pick number) vs. ADP at the time
- Actual season production vs. expected production at that draft slot
- Grade each manager's draft A-F based on total value extracted

**Trade Analysis**
For completed trades, compute post-trade production of assets on each side.
Grade trades based on remaining-season fantasy points.

### On-Demand Calculations

Some analytics are computed on request (with caching):
- "What if" scenarios (what would your record be with a different schedule?)
- Optimal lineup analysis (did you leave points on your bench?)
- Rivalry deep dives

---

## AI-Powered Features

### Weekly Recaps
After each week's scores are final, generate a league-specific recap:

```typescript
const prompt = `
You are a witty fantasy football columnist writing a weekly recap for a league
called "${league.name}". Write in a fun, roast-heavy style.

Here are this week's results:
${matchups.map(m => `${m.homeTeam.name} (${m.homeScore}) vs ${m.awayTeam.name} (${m.awayScore})`).join('\n')}

Biggest blowout: ${biggestBlowout}
Closest game: ${closestGame}
Highest scorer: ${highestScorer}
Biggest bust: ${biggestBust}
Lucky winner (won despite low score): ${luckyWinner}

Write a 200-300 word recap with a creative headline. Be playful and reference
specific matchups. End with a "Manager of the Week" and "Clown of the Week" award.
`;
```

### Trade Analyzer (Phase 2)
When a user inputs a potential trade, analyze it using:
- Remaining season projections
- Roster fit (do you need a WR more than an RB?)
- Historical performance trends
- Injury risk factors

---

## API Route Structure

```
POST   /api/auth/webhook          # Clerk webhook for user events
GET    /api/leagues                # List user's connected leagues
POST   /api/leagues/connect       # Connect a new league (triggers initial sync)
GET    /api/leagues/:id            # League overview + settings
GET    /api/leagues/:id/seasons    # List all seasons
GET    /api/leagues/:id/managers   # All-time manager list
DELETE /api/leagues/:id            # Disconnect league

GET    /api/leagues/:id/seasons/:year/matchups        # Weekly matchups
GET    /api/leagues/:id/seasons/:year/matchups/:week   # Specific week
GET    /api/leagues/:id/seasons/:year/draft            # Draft results
GET    /api/leagues/:id/seasons/:year/standings         # Season standings
GET    /api/leagues/:id/seasons/:year/transactions      # Trades + waivers

GET    /api/leagues/:id/analytics/h2h/:mgr1/:mgr2     # Head-to-head record
GET    /api/leagues/:id/analytics/managers              # All-time manager stats
GET    /api/leagues/:id/analytics/draft-grades/:year    # Draft grades
GET    /api/leagues/:id/analytics/luck                  # Luck rankings
GET    /api/leagues/:id/analytics/records               # League records (highest score, etc.)

GET    /api/leagues/:id/recaps                          # All weekly recaps
GET    /api/leagues/:id/recaps/:year/:week              # Specific recap
POST   /api/leagues/:id/recaps/:year/:week/generate     # Trigger recap generation

GET    /api/leagues/:id/rules                           # League rules
POST   /api/leagues/:id/rules                           # Add rule
PUT    /api/leagues/:id/rules/:ruleId                   # Update rule
POST   /api/leagues/:id/rules/:ruleId/vote              # Vote on rule

GET    /api/leagues/:id/dues/:year                      # Dues status
POST   /api/leagues/:id/dues/:year                      # Set dues for season
PATCH  /api/leagues/:id/dues/:dueId                     # Mark as paid

GET    /api/sync/:leagueId/status                       # Sync job status
POST   /api/sync/:leagueId/trigger                      # Manual sync trigger
```

---

## MVP Sprint Plan

### Sprint 1 (Weeks 1-2): Foundation
- [ ] Project scaffolding (Next.js + Express + Prisma + Docker)
- [ ] Database schema migration
- [ ] Clerk auth integration
- [ ] Basic league connection flow (Sleeper first — easiest API)
- [ ] Sleeper adapter: fetch league settings + managers

### Sprint 2 (Weeks 3-4): Data Ingestion
- [ ] Sleeper adapter: matchups, draft, transactions
- [ ] Player ID seeding + mapping
- [ ] Initial sync background job with progress tracking
- [ ] Historical season loop (import all past seasons)

### Sprint 3 (Weeks 5-6): Analytics Dashboard
- [ ] Head-to-head record computation
- [ ] Manager all-time stats computation
- [ ] League records page (highest score ever, longest win streak, etc.)
- [ ] Dashboard UI: league overview, standings history, rivalry pages

### Sprint 4 (Weeks 7-8): Commissioner Tools + AI
- [ ] Rules management + voting
- [ ] Dues tracker with reminder emails
- [ ] AI weekly recap generation (Claude API)
- [ ] Recap display + archive page

### Sprint 5 (Weeks 9-10): ESPN Adapter + Polish
- [ ] ESPN adapter (private league auth with cookies)
- [ ] Draft analysis / grades feature
- [ ] Subscription flow (Stripe)
- [ ] Landing page + onboarding flow

### Sprint 6 (Weeks 11-12): Yahoo + Launch Prep
- [ ] Yahoo adapter (OAuth2 flow)
- [ ] Beta testing with real leagues (r/fantasyfootball, r/DynastyFF)
- [ ] Performance optimization + caching
- [ ] Launch! 🚀

---

## File Structure

```
leaguelore/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/               # Login/signup pages
│   │   │   ├── (dashboard)/          # Authenticated pages
│   │   │   │   ├── leagues/
│   │   │   │   │   ├── [leagueId]/
│   │   │   │   │   │   ├── overview/
│   │   │   │   │   │   ├── history/
│   │   │   │   │   │   ├── rivalries/
│   │   │   │   │   │   ├── draft/
│   │   │   │   │   │   ├── trades/
│   │   │   │   │   │   ├── recaps/
│   │   │   │   │   │   ├── rules/
│   │   │   │   │   │   └── dues/
│   │   │   │   │   └── connect/      # League connection flow
│   │   │   │   └── settings/
│   │   │   └── (marketing)/          # Landing page, pricing
│   │   ├── components/
│   │   └── lib/
│   │
│   └── api/                          # Express API server
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── adapters/
│       │   │   ├── types.ts           # Shared adapter interface + normalized types
│       │   │   ├── espn.adapter.ts
│       │   │   ├── yahoo.adapter.ts
│       │   │   └── sleeper.adapter.ts
│       │   ├── jobs/                  # Background job processors
│       │   │   ├── sync.job.ts
│       │   │   ├── analytics.job.ts
│       │   │   └── recap.job.ts
│       │   ├── analytics/             # Analytics computation
│       │   └── middleware/
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   └── shared/                       # Shared types between frontend + API
│       └── types/
│
├── docker-compose.yml
├── package.json                      # Monorepo root (pnpm workspaces)
└── turbo.json                        # Turborepo config
```
