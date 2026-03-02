import { getAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  console.log('Auth object:', auth);
  const { userId } = auth;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  req.userId = userId;
  next();
};

export function getUserId(req: Request): string {
  const { userId } = getAuth(req);
  if (!userId) throw new AppError(401, 'Unauthorized');
  return userId;
}
