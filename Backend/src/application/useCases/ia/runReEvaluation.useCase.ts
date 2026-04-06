import { AppError } from '../../../shared/errors/appError';
import { EvaluatePipelineUseCase } from './evaluatePipeline.useCase';
import { GetUserByIdUseCase } from '../user/getUserById.useCase';

interface RunReEvaluationDto {
  evaluatorId: string;
  evaluationId: string;
}

export class RunReEvaluationUseCase {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly evaluatePipelineUseCase: EvaluatePipelineUseCase
  ) {}

  public async execute({ evaluatorId, evaluationId }: RunReEvaluationDto): Promise<void> {
    const evaluator = await this.getUserByIdUseCase.execute(evaluatorId);

    if (!evaluator) {
      throw new AppError('Evaluador no encontrado', 404);
    }

    if (!evaluator.modelo || !evaluator.provider) {
      throw new AppError('Evaluador sin modelo o proveedor', 400);
    }

    await this.evaluatePipelineUseCase.execute({
      evaluatorId,
      evaluationId,
      model: evaluator.modelo,
      provider: evaluator.provider,
      cleanNormsBefore: true,
    });
  }
}
