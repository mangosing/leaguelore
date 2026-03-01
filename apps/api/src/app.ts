import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { router } from './routes';

const app = express();

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? 'https://leaguelore.com' : 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api', router);

// ---------------------------------------------------------------------------
// Error Handling (must be last)
// ---------------------------------------------------------------------------
app.use(errorHandler);

export { app };
