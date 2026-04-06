import type { IStatsRepository } from '../../../domain/repositories/stats.repository'
import type { EvaluationStats } from '../../../domain/entities/evaluationStats.entity'

export class GetEvaluationStatsUseCase {
    constructor(private statsRepository: IStatsRepository) { }

    execute(from: Date, to: Date): Promise<EvaluationStats> {
        return this.statsRepository.aggregateEvaluationStats(from, to)
    }
}
