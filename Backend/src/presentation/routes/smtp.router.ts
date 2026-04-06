import { Router } from 'express';
import { SendEmailUseCase } from '../../application/useCases/smtp/smtp.useCase';
import { GetUserByIdUseCase } from '../../application/useCases/user/getUserById.useCase';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository.impl';
import { SmtpService } from '../../infrastructure/services/smtp.service';
import { SmtpController } from '../controllers/smtp.controller';
import { validateRoleMiddleware } from '../middleware/jwtMiddleware';
import { emailRateLimitMiddleware } from '../middleware/rateLimit';
import { sharedPreviewPdfUseCase } from '../shared/previewPdf.shared';

const router = Router();
const smtpService = new SmtpService();
const userRepository = new UserRepository();
const sendEmailUseCase = new SendEmailUseCase(smtpService);
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const smtpController = new SmtpController(sendEmailUseCase, sharedPreviewPdfUseCase, getUserByIdUseCase);

router.post(
  '/send-email',
  validateRoleMiddleware(['EVALUADOR']),
  emailRateLimitMiddleware,
  (req, res) => smtpController.sendEmail(req, res)
);

export default router;
