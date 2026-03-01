# LeagueLore

Your fantasy football history, unlocked.

Connect your league from ESPN, Yahoo, or Sleeper and instantly unlock decades of rivalries, analytics, draft grades, and AI-powered recaps.

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **API**: Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Auth**: Clerk (TODO)
- **Payments**: Stripe (TODO)
- **AI**: Claude API for weekly recaps
- **Monorepo**: pnpm workspaces + Turborepo

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

### Setup

```bash
# 1. Clone and install
git clone https://github.com/yourusername/leaguelore.git
cd leaguelore
pnpm install

# 2. Start databases
docker compose up -d

# 3. Set up environment
cp .env.example .env
# Edit .env with your keys (Clerk, Stripe, Anthropic)

# 4. Run database migrations
pnpm db:migrate

# 5. Seed development data
pnpm db:seed

# 6. Generate Prisma client
pnpm db:generate

# 7. Start development servers
pnpm dev
```

The API runs on `http://localhost:3001` and the frontend on `http://localhost:3000`.

### Useful Commands

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm format           # Format all files with Prettier
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode

# Database
pnpm db:migrate       # Run Prisma migrations
pnpm db:generate      # Generate Prisma client
pnpm db:seed          # Seed development data
pnpm db:studio        # Open Prisma Studio (DB GUI)

# Docker
docker compose up -d  # Start Postgres + Redis
docker compose down   # Stop containers
```

## Project Structure

```
leaguelore/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express API server
│       ├── src/
│       │   ├── adapters/    # Platform adapters (Sleeper, ESPN, Yahoo)
│       │   ├── routes/      # API route handlers
│       │   ├── services/    # Business logic
│       │   ├── jobs/        # Background job processors
│       │   └── middleware/  # Auth, error handling, rate limiting
│       └── prisma/          # Schema + migrations
├── packages/
│   └── shared/       # Shared types between frontend + API
├── docker-compose.yml
└── turbo.json
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full technical architecture, data flow diagrams, adapter pattern details, and sprint plan.

## Platform Adapters

The adapter pattern normalizes data from different fantasy platforms into a unified schema:

| Platform | Status | Auth Method |
|----------|--------|-------------|
| Sleeper  | ✅ Implemented | None (public API) |
| ESPN     | 🚧 Placeholder | Cookie-based (espn_s2 + SWID) |
| Yahoo    | 🚧 Placeholder | OAuth 2.0 |

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm --filter @leaguelore/api test:coverage

# Run in watch mode
pnpm --filter @leaguelore/api test:watch
```

Tests use Vitest with fixtures for adapter testing. Integration tests run against a separate test Postgres instance (port 5433).
