import type { IFileStorage } from '../../ports/file-storage.port';
import { DeleteEthicalRulesByEvaluationIdUseCase } from '../ethical_rules/deleteEthicalRulesByEvaluationId.useCase';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';

export class DeleteEvaluationUseCase {
  constructor(
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly deleteEthicalRulesByEvaluationId: DeleteEthicalRulesByEvaluationIdUseCase,
    private readonly fileStorage: IFileStorage
  ) {}

  public async execute(evaluationId: string): Promise<boolean> {
    const evaluation = await this.evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      return false;
    }

    await this.deleteEthicalRulesByEvaluationId.execute(evaluationId);

    const fileUrl = evaluation.file;

    await this.evaluationRepository.delete(evaluationId);

    const objectName = this.fileStorage.extractObjectName(fileUrl);
    if (objectName) {
      await this.fileStorage.delete(objectName);
    }

    return true;
  }
}
