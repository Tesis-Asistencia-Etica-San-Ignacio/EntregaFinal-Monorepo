import type { Case, CreateCase, UpdateCase } from '../entities/case.entity';
import type { PaginatedResult } from '../../shared/utils/pagination';
import type { TableQueryParams } from '../../shared/utils/tableQuery';

export interface ICaseRepository {
  findAll(): Promise<Case[]>;
  findById(id: string): Promise<Case | null>;
  create(data: CreateCase): Promise<Case>;
  update(id: string, data: UpdateCase): Promise<Case | null>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<Case[]>;
  findByUserIdPaginated(userId: string, query: TableQueryParams): Promise<PaginatedResult<Case>>;
  findByUserIdAndStoredFileName(userId: string, fileName: string): Promise<Case | null>;
}
