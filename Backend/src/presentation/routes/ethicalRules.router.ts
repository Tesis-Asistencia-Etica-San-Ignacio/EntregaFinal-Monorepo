import { Router } from "express";
import {
  CreateEthicalRuleUseCase,
  DeleteEthicalRuleUseCase,
  GetAllEthicalRulesUseCase,
  GetEthicalRuleByIdUseCase,
  GetEthicalRulesByEvaluationUseCase,
  UpdateEthicalRuleUseCase,
} from "../../application/useCases/ethical_rules";
import { GetEvaluationByIdUseCase } from "../../application/useCases/evaluation/getEvaluationsById.useCase";
import { EthicalNormRepository } from "../../infrastructure/database/repositories/ethicalRule.repository.impl";
import { EvaluationRepository } from "../../infrastructure/database/repositories/evaluation.repository.impl";
import { EthicalNormController } from "../controllers/ethicalRule.controller";
import { validateRoleMiddleware } from "../middleware/jwtMiddleware";

const router = Router();
const ethicalNormRepository = new EthicalNormRepository();
const evaluationRepository = new EvaluationRepository();
const createUseCase = new CreateEthicalRuleUseCase(ethicalNormRepository);
const getAllUseCase = new GetAllEthicalRulesUseCase(ethicalNormRepository);
const getByIdUseCase = new GetEthicalRuleByIdUseCase(ethicalNormRepository);
const getByEvaluationUseCase = new GetEthicalRulesByEvaluationUseCase(ethicalNormRepository);
const getEvaluationByIdUseCase = new GetEvaluationByIdUseCase(evaluationRepository);
const updateUseCase = new UpdateEthicalRuleUseCase(ethicalNormRepository);
const deleteUseCase = new DeleteEthicalRuleUseCase(ethicalNormRepository);
const ethicalNormController = new EthicalNormController(
  createUseCase,
  getAllUseCase,
  getByIdUseCase,
  getByEvaluationUseCase,
  getEvaluationByIdUseCase,
  updateUseCase,
  deleteUseCase
);

// Configurar rutas
router.post("/", validateRoleMiddleware(['EVALUADOR']), ethicalNormController.create);
router.get("/", validateRoleMiddleware(['EVALUADOR']), ethicalNormController.getAll);
router.get(
  "/evaluation/:evaluationId",
  validateRoleMiddleware(['EVALUADOR']),
  ethicalNormController.getByEvaluation
);
router.patch("/:id", validateRoleMiddleware(['EVALUADOR']), ethicalNormController.update);
router.delete("/:id", validateRoleMiddleware(['EVALUADOR']), ethicalNormController.delete);

export default router;
