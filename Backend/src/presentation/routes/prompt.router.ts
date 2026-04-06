import { Router } from "express";
import { CreatePromptUseCase } from "../../application/useCases/prompt/createPrompt.useCase";
import { DeletePromptUseCase } from "../../application/useCases/prompt/deletePrompt.useCase";
import { GetAllPromptsUseCase } from "../../application/useCases/prompt/getAllPrompt.useCase";
import { GetPromptByIdUseCase } from "../../application/useCases/prompt/getPromptById.useCase";
import { GetPromptsByEvaluatorIdUseCase } from "../../application/useCases/prompt/getPromptsByEvaluatorId.useCase";
import { ResetPromptsUseCase } from "../../application/useCases/prompt/resetPrompt.useCase";
import { UpdatePromptUseCase } from "../../application/useCases/prompt/updatePrompt.useCase";
import { PromptRepository } from "../../infrastructure/database/repositories/prompt.repository.impl";
import { PromptController } from "../controllers/prompt.controller";
import { validateRoleMiddleware } from "../middleware/jwtMiddleware";

const router = Router();
const promptRepository = new PromptRepository();
const createPromptUseCase = new CreatePromptUseCase(promptRepository);
const getAllPromptsUseCase = new GetAllPromptsUseCase(promptRepository);
const getPromptByIdUseCase = new GetPromptByIdUseCase(promptRepository);
const updatePromptUseCase = new UpdatePromptUseCase(promptRepository);
const deletePromptUseCase = new DeletePromptUseCase(promptRepository);
const resetPromptsUseCase = new ResetPromptsUseCase(promptRepository);
const getPromptsByEvaluatorIdUseCase = new GetPromptsByEvaluatorIdUseCase(promptRepository);
const promptController = new PromptController(
  createPromptUseCase,
  getAllPromptsUseCase,
  getPromptByIdUseCase,
  updatePromptUseCase,
  deletePromptUseCase,
  resetPromptsUseCase,
  getPromptsByEvaluatorIdUseCase
);

router.get(
  "/my",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.getByEvaluatorId
);
router.post(
  "/my/reset-prompts",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.resetPrompts
);
router.patch(
  "/:id",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.update
);
router.get(
  "/",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.getAll
);
router.get(
  "/:id",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.getById
);
router.post(
  "/",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.create
);
router.delete(
  "/:id",
  validateRoleMiddleware(["EVALUADOR"]),
  promptController.delete
);

export default router;
