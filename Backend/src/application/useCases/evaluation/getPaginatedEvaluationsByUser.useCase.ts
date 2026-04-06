import type { Evaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';
import type { PaginatedResult } from '../../../shared/utils/pagination';
import type { TableQueryParams } from '../../../shared/utils/tableQuery';

export class GetPaginatedEvaluationsByUserUseCase {
  constructor(private readonly evaluationRepository: IEvaluationRepository) {}

  public async execute(
    userId: string,
    query: TableQueryParams
  ): Promise<PaginatedResult<Evaluation>> {
    const [result, facets] = await Promise.all([
      this.evaluationRepository.findByUserIdPaginated(userId, query),
      this.evaluationRepository.getFacetCountsByUserId(userId, query),
    ]);

    return {
      ...result,
      facets,
    };
  }
}
