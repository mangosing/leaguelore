import { clerkMiddleware } from '@clerk/express';
import { app } from './app';
import { prisma } from './config/db';
import { env } from './config/env';

app.use(clerkMiddleware());

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    console.warn('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const server = app.listen(env.API_PORT, () => {
    console.warn(`🚀 API server running on http://localhost:${env.API_PORT}`);
    console.warn(`   Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.warn('\n🔄 Shutting down gracefully...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
