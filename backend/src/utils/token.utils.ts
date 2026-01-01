import jwt from 'jsonwebtoken';
import { JWTPayload } from '../interfaces/user.interface';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class TokenUtils {
  static createAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
  }

  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, SECRET_KEY) as JWTPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }
}
