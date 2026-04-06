import { UpdateEvaluationDto } from '../../dtos/evaluation.dto';
import type { Evaluation, UpdateEvaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';

export class UpdateEvaluationUseCase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  public async execute(id: string, data: UpdateEvaluationDto): Promise<Evaluation | null> {
    const existing = await this.evaluationRepository.findById(id);
    if (!existing) return null;

    const command: UpdateEvaluation = { ...data };

    if (command.id_fundanet && command.id_fundanet !== existing.id_fundanet) {
      const maxVersion = await this.evaluationRepository.findMaxVersionByFundaNet(command.id_fundanet);
      command.version = maxVersion + 1;
    }

    return this.evaluationRepository.update(id, command);
  }
}
