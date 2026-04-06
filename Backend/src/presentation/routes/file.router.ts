import { Router } from 'express';
import multer from 'multer';
import { UploadEvaluationFileUseCase } from '../../application/useCases/file/uploadEvaluationFile.useCase';
import { DownloadPdfFileUseCase } from '../../application/useCases/file/downloadPdfFile.useCase';
import { GetAllFilesUseCase } from '../../application/useCases/file/getAllFiles.useCase';
import { CreateEvaluationUseCase } from '../../application/useCases/evaluation/createEvaluation.useCase';
import { CaseRepository } from '../../infrastructure/database/repositories/case.repository.impl';
import { EvaluationRepository } from '../../infrastructure/database/repositories/evaluation.repository.impl';
import { MinioFileStorageService } from '../../infrastructure/services/minio-file-storage.service';
import { AppError } from '../../shared/errors/appError';
import { FileController } from '../controllers/file.controller';
import { validateRoleMiddleware } from '../middleware/jwtMiddleware';
import { uploadRateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();
const caseRepository = new CaseRepository();
const evaluationRepository = new EvaluationRepository();
const fileStorage = new MinioFileStorageService();
const createEvaluationUseCase = new CreateEvaluationUseCase(evaluationRepository);
const uploadEvaluationFileUseCase = new UploadEvaluationFileUseCase(createEvaluationUseCase, fileStorage);
const getAllFilesUseCase = new GetAllFilesUseCase(caseRepository, evaluationRepository, fileStorage);
const downloadPdfFileUseCase = new DownloadPdfFileUseCase(caseRepository, evaluationRepository, fileStorage);
const fileController = new FileController(
  uploadEvaluationFileUseCase,
  getAllFilesUseCase,
  downloadPdfFileUseCase
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const isPdfMimeType = file.mimetype === 'application/pdf';
    const hasPdfExtension = /\.pdf$/i.test(file.originalname);

    if (!isPdfMimeType || !hasPdfExtension) {
      cb(new AppError('Solo se permiten archivos PDF', 400));
      return;
    }

    cb(null, true);
  },
});

router.post(
  '/upload',
  validateRoleMiddleware(['EVALUADOR']),
  uploadRateLimitMiddleware,
  (req, res, next) => upload.single('file')(req, res, next),
  fileController.uploadFile
);
router.get('/', validateRoleMiddleware(['EVALUADOR', 'INVESTIGADOR']), fileController.getAllFiles);
router.get('/pdf/:fileName', validateRoleMiddleware(['EVALUADOR', 'INVESTIGADOR']), fileController.downloadPdf);

export default router;
