import { Request, Response, NextFunction } from 'express'
import { GetEvaluationStatsUseCase } from '../../application/useCases/stats/evaluationStats.UseCase'

export class StatsController {
    constructor(private getStatsUseCase: GetEvaluationStatsUseCase) { }

    getEvaluationStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { from, to } = req.query
            if (!from || !to) return res.status(400).json({ message: 'from/to required' })

            const data = await this.getStatsUseCase.execute(
                new Date(from as string),
                new Date(to as string)
            )
            res.json(data)
        } catch (e) { next(e) }
    }
}
