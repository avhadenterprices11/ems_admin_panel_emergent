import { Request, Response, NextFunction } from 'express';
import { TokenUtils } from '../utils/token.utils';
import db from '../database/db';
import { User } from '../interfaces/user.interface';

export interface AuthRequest extends Request {
  user?: User;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ detail: 'Not authenticated' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = TokenUtils.verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ detail: 'Invalid or expired token' });
      return;
    }

    const user = await db<User>('users')
      .where({ id: payload.sub, deleted_at: null })
      .first();

    if (!user) {
      res.status(401).json({ detail: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ detail: 'Invalid token' });
  }
}
