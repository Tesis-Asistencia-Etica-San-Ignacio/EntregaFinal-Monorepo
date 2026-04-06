import { AppError } from '../../../shared/errors/appError';
import type { ICaseRepository } from '../../../domain/repositories/case.repository';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';
import type { IFileStorage } from '../../ports/file-storage.port';

export class DownloadPdfFileUseCase {
  constructor(
    private readonly caseRepository: ICaseRepository,
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  public async execute(fileName: string, userId: string, userRole: string) {
    const normalizedFileName = fileName.trim();
    if (!normalizedFileName) {
      throw new AppError('Archivo no encontrado', 404);
    }

    const accessibleResource =
      userRole === 'INVESTIGADOR'
        ? await this.caseRepository.findByUserIdAndStoredFileName(userId, normalizedFileName)
        : await this.evaluationRepository.findByUserIdAndStoredFileName(userId, normalizedFileName);

    if (!accessibleResource) {
      throw new AppError('Archivo no encontrado', 404);
    }

    return this.fileStorage.getStream(normalizedFileName);
  }
}
