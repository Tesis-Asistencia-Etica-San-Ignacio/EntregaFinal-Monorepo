import type { Evaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';

export class GetEvaluationsByUserUseCase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  public async execute(userId: string): Promise<Evaluation[]> {
    return this.evaluationRepository.findByUserId(userId);
  }
}
