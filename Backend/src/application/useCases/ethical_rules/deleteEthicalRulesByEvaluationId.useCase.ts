import type { IEthicalNormRepository } from '../../../domain/repositories/ethicalRule.repository';

export class DeleteEthicalRulesByEvaluationIdUseCase {
    constructor(private readonly ethicalNormRepository: IEthicalNormRepository) { }

    public async execute(evaluationId: string): Promise<void> {
        await this.ethicalNormRepository.deleteByEvaluationId(evaluationId);
    }
}
