import type { ICaseRepository } from '../../../domain/repositories/case.repository';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';
import type { IFileStorage } from '../../ports/file-storage.port';

export class GetAllFilesUseCase {
  constructor(
    private readonly caseRepository: ICaseRepository,
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly fileStorage: IFileStorage
  ) {}

  public async execute(userId: string, userRole: string) {
    const [files, accessibleResources] = await Promise.all([
      this.fileStorage.list(),
      userRole === 'INVESTIGADOR'
        ? this.caseRepository.findByUserId(userId)
        : this.evaluationRepository.findByUserId(userId),
    ]);

    const accessibleFileNames = new Set(
      accessibleResources
        .map((resource) =>
          this.fileStorage.extractObjectName('pdf' in resource ? resource.pdf : resource.file)
        )
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    );

    return files.filter((file) => accessibleFileNames.has(String(file.name ?? '')));
  }
}
