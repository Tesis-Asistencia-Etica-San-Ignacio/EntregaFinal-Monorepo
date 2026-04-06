import { Router } from 'express';
import { GetEthicalRulesByEvaluationUseCase } from '../../application/useCases/ethical_rules/getEthicalRulesByEvaluation.useCase';
import { GetEvaluationByIdUseCase } from '../../application/useCases/evaluation/getEvaluationsById.useCase';
import { EthicalNormRepository } from '../../infrastructure/database/repositories/ethicalRule.repository.impl';
import { EvaluationRepository } from '../../infrastructure/database/repositories/evaluation.repository.impl';
import { PdfController } from '../controllers/pdf.controller';
import { validateRoleMiddleware } from "../middleware/jwtMiddleware";
import { heavyOperationRateLimitMiddleware } from '../middleware/rateLimit';
import { sharedPreviewPdfUseCase } from '../shared/previewPdf.shared';

const router = Router();
const ethicalNormRepository = new EthicalNormRepository();
const evaluationRepository = new EvaluationRepository();
const getEthicalRulesByEvaluationUseCase = new GetEthicalRulesByEvaluationUseCase(ethicalNormRepository);
const getEvaluationByIdUseCase = new GetEvaluationByIdUseCase(evaluationRepository);
const pdfController = new PdfController(
  sharedPreviewPdfUseCase,
  getEthicalRulesByEvaluationUseCase,
  getEvaluationByIdUseCase
);

router.post('/preview-evaluator', validateRoleMiddleware(['EVALUADOR']), heavyOperationRateLimitMiddleware, (req, res) =>
  pdfController.previewEvaluatorPdf(req, res)
);
router.post('/preview-investigator', validateRoleMiddleware(['INVESTIGADOR']), heavyOperationRateLimitMiddleware, (req, res) =>
  pdfController.previewInvestigatorPdf(req, res)
);

export default router;
