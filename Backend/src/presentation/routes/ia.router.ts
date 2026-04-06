import { Router } from 'express';
import { GenerateCompletionUseCase } from '../../application/useCases/ia/generateCompletion.useCase';
import { ModifyProviderApiKeyUseCase } from '../../application/useCases/ia/modifyProviderApiKey.useCase';
import { ObtainModelsUseCase } from '../../application/useCases/ia/obtainModels.useCase';
import { RunEvaluationUseCase } from '../../application/useCases/ia/runEvaluation.useCase';
import { RunReEvaluationUseCase } from '../../application/useCases/ia/runReEvaluation.useCase';
import { EvaluatePipelineUseCase } from '../../application/useCases/ia/evaluatePipeline.useCase';
import { CreateEthicalRulesUseCase } from '../../application/useCases/ethical_rules/createEthicalRules.useCase';
import { DeleteEthicalRulesByEvaluationIdUseCase } from '../../application/useCases/ethical_rules/deleteEthicalRulesByEvaluationId.useCase';
import { GetEvaluationByIdUseCase } from '../../application/useCases/evaluation/getEvaluationsById.useCase';
import { GetEvaluationsByUserUseCase } from '../../application/useCases/evaluation/getEvaluationsByUser.useCase';
import { UpdateEvaluationUseCase } from '../../application/useCases/evaluation/updateEvaluation.useCase';
import { GetPromptsByEvaluatorIdUseCase } from '../../application/useCases/prompt/getPromptsByEvaluatorId.useCase';
import { GetUserByIdUseCase } from '../../application/useCases/user/getUserById.useCase';
import { EthicalNormRepository } from '../../infrastructure/database/repositories/ethicalRule.repository.impl';
import { EvaluationRepository } from '../../infrastructure/database/repositories/evaluation.repository.impl';
import { PromptRepository } from '../../infrastructure/database/repositories/prompt.repository.impl';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository.impl';
import { MinioFileStorageService } from '../../infrastructure/services/minio-file-storage.service';
import { IAController } from '../controllers/ia.controller';
import { validateRoleMiddleware } from '../middleware/jwtMiddleware';
import { heavyOperationRateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();
const userRepository = new UserRepository();
const evaluationRepository = new EvaluationRepository();
const ethicalNormRepository = new EthicalNormRepository();
const promptRepository = new PromptRepository();
const fileStorage = new MinioFileStorageService();
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const getEvaluationByIdUseCase = new GetEvaluationByIdUseCase(evaluationRepository);
const getEvaluationsByUserUseCase = new GetEvaluationsByUserUseCase(evaluationRepository);
const getPromptsByEvaluatorIdUseCase = new GetPromptsByEvaluatorIdUseCase(promptRepository);
const generateCompletionUseCase = new GenerateCompletionUseCase();
const deleteEthicalRulesByEvaluationIdUseCase = new DeleteEthicalRulesByEvaluationIdUseCase(
  ethicalNormRepository
);
const createEthicalRulesUseCase = new CreateEthicalRulesUseCase(ethicalNormRepository);
const updateEvaluationUseCase = new UpdateEvaluationUseCase(evaluationRepository);
const obtainModelsUseCase = new ObtainModelsUseCase();
const modifyProviderApiKeyUseCase = new ModifyProviderApiKeyUseCase();
const evaluatePipelineUseCase = new EvaluatePipelineUseCase(
  getEvaluationByIdUseCase,
  getEvaluationsByUserUseCase,
  getPromptsByEvaluatorIdUseCase,
  generateCompletionUseCase,
  deleteEthicalRulesByEvaluationIdUseCase,
  createEthicalRulesUseCase,
  updateEvaluationUseCase,
  fileStorage
);
const runEvaluationUseCase = new RunEvaluationUseCase(getUserByIdUseCase, evaluatePipelineUseCase);
const runReEvaluationUseCase = new RunReEvaluationUseCase(getUserByIdUseCase, evaluatePipelineUseCase);
const iaController = new IAController(
  runEvaluationUseCase,
  runReEvaluationUseCase,
  obtainModelsUseCase,
  modifyProviderApiKeyUseCase
);

router.post('/evaluate', validateRoleMiddleware(['EVALUADOR']), heavyOperationRateLimitMiddleware, iaController.evaluate);
router.post('/re-evaluate', validateRoleMiddleware(['EVALUADOR']), heavyOperationRateLimitMiddleware, iaController.reEvaluate);
router.get('/models', validateRoleMiddleware(['EVALUADOR']), iaController.getModels);
router.post('/config/apikey', validateRoleMiddleware(['EVALUADOR']), heavyOperationRateLimitMiddleware, iaController.modifyApiKey);

export default router;
