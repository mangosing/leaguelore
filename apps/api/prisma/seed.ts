import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.warn('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'sean@leaguelore.dev' },
    update: {},
    create: {
      email: 'sean@leaguelore.dev',
      name: 'Sean',
      clerkId: 'dev_user_001',
    },
  });

  // Create a sample league
  const league = await prisma.league.upsert({
    where: {
      platform_platformLeagueId: {
        platform: 'SLEEPER',
        platformLeagueId: '924039165809029120',
      },
    },
    update: {},
    create: {
      name: 'The Taco Bowl League',
      platform: 'SLEEPER',
      platformLeagueId: '924039165809029120',
      scoringType: 'PPR',
      leagueType: 'REDRAFT',
      teamCount: 12,
    },
  });

  // Create the user as commissioner
  await prisma.manager.upsert({
    where: {
      leagueId_platformManagerId: {
        leagueId: league.id,
        platformManagerId: 'dev_mgr_001',
      },
    },
    update: {},
    create: {
      userId: user.id,
      leagueId: league.id,
      displayName: 'Sean',
      platformManagerId: 'dev_mgr_001',
      isCommissioner: true,
    },
  });

  console.warn('✅ Seed complete');
  console.warn(`   User: ${user.email}`);
  console.warn(`   League: ${league.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
