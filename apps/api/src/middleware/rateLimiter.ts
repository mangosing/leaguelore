import type { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter for development.
 *
 * TODO: Replace with Redis-backed rate limiting for production
 *   - Use `rate-limiter-flexible` with Redis store
 *   - Different limits for different routes (sync endpoints get lower limits)
 */

const requests = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip || 'unknown';
  const now = Date.now();

  const record = requests.get(key);

  if (!record || now > record.resetTime) {
    requests.set(key, { count: 1, resetTime: now + WINDOW_MS });
    next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    });
    return;
  }

  record.count++;
  next();
};
