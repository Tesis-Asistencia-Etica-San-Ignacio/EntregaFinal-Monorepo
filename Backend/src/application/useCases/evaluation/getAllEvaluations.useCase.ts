import type { Evaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';

export class GetAllEvaluationsUseCase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  public async execute(): Promise<Evaluation[]> {
    return this.evaluationRepository.findAll();
  }
}
