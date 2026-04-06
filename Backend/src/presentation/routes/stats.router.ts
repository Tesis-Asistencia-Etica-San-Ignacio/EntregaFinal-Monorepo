import { Router } from 'express'
import { GetEvaluationStatsUseCase } from '../../application/useCases/stats/evaluationStats.UseCase'
import { StatsRepositoryImpl } from '../../infrastructure/database/repositories/stats.repository.impl'
import { StatsController } from '../controllers/stats.controller'
import { validateRoleMiddleware } from '../middleware/jwtMiddleware'

const statsRepository = new StatsRepositoryImpl()
const getEvaluationStatsUseCase = new GetEvaluationStatsUseCase(statsRepository)
const statsController = new StatsController(getEvaluationStatsUseCase)
const router = Router()

router.get(
    '/evaluations',
    validateRoleMiddleware(['EVALUADOR']),
    statsController.getEvaluationStats
)

export default router
