import { CaseModel } from '../models/case.model';
import type { Case, CreateCase, UpdateCase } from '../../../domain/entities/case.entity';
import type { ICaseRepository } from '../../../domain/repositories/case.repository';
import { buildPaginatedResult, escapeRegex, isValidObjectId } from '../../../shared/utils';
import type { PaginatedResult } from '../../../shared/utils/pagination';
import type { TableQueryParams } from '../../../shared/utils/tableQuery';
import { buildMinioPublicFileUrl } from '../../services/minio-file-storage.service';

const ALLOWED_SORT_FIELDS: Record<string, string> = {
  id: '_id',
  nombre_proyecto: 'nombre_proyecto',
  version: 'version',
  codigo: 'codigo',
  fecha: 'fecha',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export class CaseRepository implements ICaseRepository {
  private toEntity(doc: any): Case {
    return {
      id: doc._id.toString(),
      uid: doc.uid.toString(),
      nombre_proyecto: doc.nombre_proyecto,
      version: doc.version,
      codigo: doc.codigo,
      pdf: doc.pdf,
      fecha: doc.fecha,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  public async findAll(): Promise<Case[]> {
    const results = await CaseModel.find({});
    return results.map((doc) => this.toEntity(doc));
  }

  public async findById(id: string): Promise<Case | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const doc = await CaseModel.findById(id);
    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  public async create(data: CreateCase): Promise<Case> {
    const doc = await CaseModel.create(data);
    return this.toEntity(doc);
  }

  public async update(id: string, data: UpdateCase): Promise<Case | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const doc = await CaseModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  public async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const doc = await CaseModel.findByIdAndDelete(id);
    return doc !== null;
  }

  public async findByUserId(userId: string): Promise<Case[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    const results = await CaseModel.find({ uid: userId });
    return results.map((doc) => this.toEntity(doc));
  }

  public async findByUserIdAndStoredFileName(userId: string, fileName: string): Promise<Case | null> {
    if (!isValidObjectId(userId) || fileName.trim().length === 0) {
      return null;
    }

    const exactUrl = buildMinioPublicFileUrl(fileName);
    const legacyPathRegex = new RegExp(`/uploads/${escapeRegex(fileName)}$`);

    const doc = await CaseModel.findOne({
      uid: userId,
      $or: [{ pdf: exactUrl }, { pdf: legacyPathRegex }],
    });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  public async findByUserIdPaginated(
    userId: string,
    query: TableQueryParams
  ): Promise<PaginatedResult<Case>> {
    if (!isValidObjectId(userId)) {
      return buildPaginatedResult([], 0, query);
    }

    const mongoQuery: Record<string, unknown> = { uid: userId };

    if (query.search) {
      const normalizedSearch = query.search.trim();
      const regex = new RegExp(escapeRegex(normalizedSearch), 'i');
      const searchClauses: Record<string, unknown>[] = [
        { nombre_proyecto: regex },
        { codigo: regex },
      ];

      if (/^[0-9a-fA-F]{24}$/.test(normalizedSearch)) {
        searchClauses.push({ _id: normalizedSearch });
      }

      if (/^\d+$/.test(normalizedSearch)) {
        searchClauses.push({ version: Number(normalizedSearch) });
      }

      mongoQuery.$or = searchClauses;
    }

    const sortField = query.sortBy ? ALLOWED_SORT_FIELDS[query.sortBy] ?? 'createdAt' : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [results, totalItems] = await Promise.all([
      CaseModel.find(mongoQuery)
        .sort({ [sortField]: sortOrder, _id: sortOrder })
        .skip(query.skip)
        .limit(query.pageSize),
      CaseModel.countDocuments(mongoQuery),
    ]);

    const items = results.map((doc) => this.toEntity(doc));

    return buildPaginatedResult(items, totalItems, query);
  }
}
