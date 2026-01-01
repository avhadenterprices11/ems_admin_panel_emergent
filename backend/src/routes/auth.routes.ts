import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDTO } from '../utils/validation.utils';
import { LoginDTO } from '../dtos/auth.dto';

const router = Router();
const authController = new AuthController();

router.post('/login', validateDTO(LoginDTO), (req, res) => authController.login(req, res));

router.post('/logout', (req, res) => authController.logout(req, res));

router.get('/validate', (req, res) => authController.validateToken(req, res));

export default router;
