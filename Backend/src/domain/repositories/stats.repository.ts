import type { EvaluationStats } from '../entities/evaluationStats.entity'

export interface IStatsRepository {
    aggregateEvaluationStats(from: Date, to: Date): Promise<EvaluationStats>
}
