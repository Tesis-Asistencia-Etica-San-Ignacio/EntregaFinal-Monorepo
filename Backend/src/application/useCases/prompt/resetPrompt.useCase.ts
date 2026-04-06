import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';
import { seedPromptsForEvaluator } from '../../services/promptSeeding.service';

export class ResetPromptsUseCase {
  constructor(private readonly promptRepository: IPromptRepository) { }

  public async execute(evaluatorId: string): Promise<void> {
    // 1. Borrar todos los prompts del evaluador
    if (typeof this.promptRepository.deleteByEvaluatorId !== 'function') {
      throw new Error('El repositorio no implementa deleteByEvaluatorId');
    }
    await this.promptRepository.deleteByEvaluatorId(evaluatorId);

    // 2. Volver a sembrar usando el servicio compartido
    await seedPromptsForEvaluator(evaluatorId, this.promptRepository);
  }
}
