import type { CreateEvaluation, Evaluation, EvaluationStatus, UpdateEvaluation } from '../entities/evaluation.entity';
import type { FacetCounts, PaginatedResult } from '../../shared/utils/pagination';
import type { TableQueryParams } from '../../shared/utils/tableQuery';

export interface IEvaluationRepository {
  findAll(): Promise<Evaluation[]>;
  findById(id: string): Promise<Evaluation | null>;
  create(data: CreateEvaluation): Promise<Evaluation>;
  update(id: string, data: UpdateEvaluation): Promise<Evaluation | null>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<Evaluation[]>;
  findByUserIdPaginated(userId: string, query: TableQueryParams): Promise<PaginatedResult<Evaluation>>;
  findMaxVersionByFundaNet(idFundanet: string): Promise<number>;
  getFacetCountsByUserId(userId: string, query: TableQueryParams): Promise<FacetCounts>;
  findByUserIdAndStoredFileName(userId: string, fileName: string): Promise<Evaluation | null>;
}
