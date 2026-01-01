import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDTO, TokenValidationDTO } from '../dtos/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginDto = req.body as LoginDTO;
      const tokenResponse = await this.authService.login(loginDto);
      res.status(200).json(tokenResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        res.status(401).json({ detail: error.message });
      } else {
        res.status(500).json({ detail: 'Internal server error' });
      }
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response: TokenValidationDTO = { valid: false, user: undefined };
        res.status(200).json(response);
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const user = await this.authService.validateToken(token);

      if (user) {
        const response: TokenValidationDTO = { valid: true, user };
        res.status(200).json(response);
      } else {
        const response: TokenValidationDTO = { valid: false, user: undefined };
        res.status(200).json(response);
      }
    } catch (error) {
      const response: TokenValidationDTO = { valid: false, user: undefined };
      res.status(200).json(response);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'Logged out successfully' });
  }
}
