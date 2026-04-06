import type { Evaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';

export class GetEvaluationByIdUseCase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  public async execute(id: string): Promise<Evaluation | null> {
    return this.evaluationRepository.findById(id);
  }
}
