import type { Case } from '../../../domain/entities/case.entity';
import type { ICaseRepository } from '../../../domain/repositories/case.repository';
import type { PaginatedResult } from '../../../shared/utils/pagination';
import type { TableQueryParams } from '../../../shared/utils/tableQuery';

export class GetPaginatedCasesByUserIdUseCase {
  constructor(private readonly caseRepository: ICaseRepository) {}

  public async execute(
    userId: string,
    query: TableQueryParams
  ): Promise<PaginatedResult<Case>> {
    return this.caseRepository.findByUserIdPaginated(userId, query);
  }
}
