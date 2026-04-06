import { Router } from "express";
import {
  CreateCaseFromPreviewUseCase,
  CreateCaseUseCase,
  DeleteCaseUseCase,
  GetAllCasesUseCase,
  GetCaseByIdUseCase,
  GetPaginatedCasesByUserIdUseCase,
  UpdateCaseUseCase,
} from "../../application/useCases/case";
import { CaseRepository } from "../../infrastructure/database/repositories/case.repository.impl";
import { MinioFileStorageService } from "../../infrastructure/services/minio-file-storage.service";
import { CaseController } from "../controllers/case.controller";
import { validateRoleMiddleware } from "../middleware/jwtMiddleware";
import { sharedPreviewPdfUseCase } from "../shared/previewPdf.shared";

const router = Router();
const caseRepository = new CaseRepository();
const fileStorage = new MinioFileStorageService();
const createCaseUseCase = new CreateCaseUseCase(caseRepository);
const createCaseFromPreviewUseCase = new CreateCaseFromPreviewUseCase(
  sharedPreviewPdfUseCase,
  createCaseUseCase,
  fileStorage
);
const deleteCaseUseCase = new DeleteCaseUseCase(caseRepository);
const getCaseByIdUseCase = new GetCaseByIdUseCase(caseRepository);
const updateCaseUseCase = new UpdateCaseUseCase(caseRepository);
const getAllCasesUseCase = new GetAllCasesUseCase(caseRepository);
const getPaginatedCasesByUserIdUseCase = new GetPaginatedCasesByUserIdUseCase(caseRepository);
const caseController = new CaseController(
  createCaseFromPreviewUseCase,
  getAllCasesUseCase,
  getCaseByIdUseCase,
  updateCaseUseCase,
  deleteCaseUseCase,
  getPaginatedCasesByUserIdUseCase
);

router.post("/", validateRoleMiddleware(['INVESTIGADOR']), caseController.create);
router.get('/my', validateRoleMiddleware(['INVESTIGADOR']), caseController.getMyCases);
router.get("/:id", validateRoleMiddleware(['INVESTIGADOR']), caseController.getById);
router.patch("/:id", validateRoleMiddleware(['INVESTIGADOR']), caseController.update);
router.delete("/:id", validateRoleMiddleware(['INVESTIGADOR']), caseController.delete);

export default router;
