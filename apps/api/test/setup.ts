import { beforeAll, afterAll } from 'vitest';

/**
 * Test setup file.
 *
 * For unit tests (adapters, analytics): no DB needed, runs fast.
 * For integration tests (routes, services): uses test DB on port 5433.
 *
 * To run integration tests:
 *   1. docker compose up postgres-test
 *   2. DATABASE_URL=$DATABASE_URL_TEST pnpm prisma:migrate
 *   3. pnpm test
 */

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.API_PORT = '0'; // Random port for supertest
});

afterAll(async () => {
  // Cleanup if needed
});
