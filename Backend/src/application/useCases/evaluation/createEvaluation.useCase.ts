import { CreateEvaluationDto } from '../../dtos/evaluation.dto';
import type { CreateEvaluation, Evaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';

export class CreateEvaluationUseCase {
  constructor(
    private readonly evaluationRepository: IEvaluationRepository,
  ) { }

  public async execute(data: CreateEvaluationDto): Promise<Evaluation> {
    const command: CreateEvaluation = {
      ...data,
      version: data.version ?? 1,
    };

    return this.evaluationRepository.create(command);
  }
}


