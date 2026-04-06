import { Router } from "express";
import { DeleteEthicalRulesByEvaluationIdUseCase } from "../../application/useCases/ethical_rules/deleteEthicalRulesByEvaluationId.useCase";
import { CreateEvaluationUseCase } from "../../application/useCases/evaluation/createEvaluation.useCase";
import { DeleteEvaluationUseCase } from "../../application/useCases/evaluation/deleteEvaluation.useCase";
import { GetAllEvaluationsUseCase } from "../../application/useCases/evaluation/getAllEvaluations.useCase";
import { GetEvaluationByIdUseCase } from "../../application/useCases/evaluation/getEvaluationsById.useCase";
import { GetPaginatedEvaluationsByUserUseCase } from "../../application/useCases/evaluation/getPaginatedEvaluationsByUser.useCase";
import { UpdateEvaluationUseCase } from "../../application/useCases/evaluation/updateEvaluation.useCase";
import { EthicalNormRepository } from "../../infrastructure/database/repositories/ethicalRule.repository.impl";
import { EvaluationRepository } from "../../infrastructure/database/repositories/evaluation.repository.impl";
import { MinioFileStorageService } from "../../infrastructure/services/minio-file-storage.service";
import { EvaluationController } from "../controllers/evaluation.controller";
import { validateRoleMiddleware } from "../middleware/jwtMiddleware";

const router = Router();
const evaluationRepository = new EvaluationRepository();
const ethicalNormRepository = new EthicalNormRepository();
const fileStorage = new MinioFileStorageService();
const createEvaluationUseCase = new CreateEvaluationUseCase(evaluationRepository);
const getAllEvaluationsUseCase = new GetAllEvaluationsUseCase(evaluationRepository);
const getEvaluationByIdUseCase = new GetEvaluationByIdUseCase(evaluationRepository);
const updateEvaluationUseCase = new UpdateEvaluationUseCase(evaluationRepository);
const getPaginatedEvaluationsByUserUseCase = new GetPaginatedEvaluationsByUserUseCase(evaluationRepository);
const deleteEthicalRulesByEvaluationIdUseCase = new DeleteEthicalRulesByEvaluationIdUseCase(
  ethicalNormRepository
);
const deleteEvaluationUseCase = new DeleteEvaluationUseCase(
  evaluationRepository,
  deleteEthicalRulesByEvaluationIdUseCase,
  fileStorage
);
const evaluationController = new EvaluationController(
  createEvaluationUseCase,
  getAllEvaluationsUseCase,
  getEvaluationByIdUseCase,
  updateEvaluationUseCase,
  deleteEvaluationUseCase,
  getPaginatedEvaluationsByUserUseCase
);

router.get("/my", validateRoleMiddleware(["EVALUADOR"]), evaluationController.getByUser);
router.get("/:id", validateRoleMiddleware(["EVALUADOR"]), evaluationController.getById);
router.get("/", validateRoleMiddleware(["EVALUADOR"]), evaluationController.getAll);
router.post("/", validateRoleMiddleware(["EVALUADOR"]), evaluationController.create);
router.patch("/:id", validateRoleMiddleware(["EVALUADOR"]), evaluationController.update);
router.delete("/:id", validateRoleMiddleware(["EVALUADOR"]), evaluationController.delete);

export default router;
