import { Router } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { GetSessionUseCase, LoginUseCase, RefreshTokenUseCase } from '../../application/useCases/auth';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository.impl';
import { AuthController } from '../controllers/auth.controller';
import { authRateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const loginUseCase = new LoginUseCase(authService);
const refreshTokenUseCase = new RefreshTokenUseCase(authService);
const getSessionUseCase = new GetSessionUseCase(authService);
const authController = new AuthController(loginUseCase, refreshTokenUseCase, getSessionUseCase);

router.post('/login', authRateLimitMiddleware, (req, res) => authController.login(req, res));
router.post('/refresh', authRateLimitMiddleware, (req, res) => authController.refreshToken(req, res));
router.get('/me', (req, res) => authController.getSession(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
