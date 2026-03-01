import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Auth middleware — verifies Clerk JWT from Authorization header.
 *
 * TODO: Implement Clerk verification
 *   1. pnpm add @clerk/express
 *   2. Replace this stub with clerkMiddleware() or use getAuth()
 *   3. See: https://clerk.com/docs/references/express/overview
 *
 * For now, in development mode, this passes through with a mock user.
 */

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  // TODO: Replace with actual Clerk verification
  if (process.env.NODE_ENV === 'development') {
    // Mock auth for local development
    req.userId = req.headers['x-dev-user-id'] as string || 'dev_user_001';
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header');
  }

  // TODO: Verify Clerk JWT here
  // const token = authHeader.split(' ')[1];
  // const decoded = await clerkClient.verifyToken(token);
  // req.userId = decoded.sub;

  next();
};
