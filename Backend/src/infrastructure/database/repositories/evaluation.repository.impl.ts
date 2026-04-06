import { EvaluationModel } from '../models/evaluation.model';
import type { CreateEvaluation, Evaluation, UpdateEvaluation } from '../../../domain/entities/evaluation.entity';
import type { IEvaluationRepository } from '../../../domain/repositories/evaluation.repository';
import { buildPaginatedResult, escapeRegex, isValidObjectId } from '../../../shared/utils';
import type { FacetCounts, PaginatedResult } from '../../../shared/utils/pagination';
import type { TableQueryParams } from '../../../shared/utils/tableQuery';
import { buildMinioPublicFileUrl } from '../../services/minio-file-storage.service';

export type EvaluationStatus = 'PENDIENTE' | 'EN CURSO' | 'EVALUADO';

const ALLOWED_SORT_FIELDS: Record<string, string> = {
  id: '_id',
  id_fundanet: 'id_fundanet',
  version: 'version',
  correo_estudiante: 'correo_estudiante',
  file: 'file',
  tipo_error: 'tipo_error',
  aprobado: 'aprobado',
  estado: 'estado',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

const EVALUATION_STATUSES: EvaluationStatus[] = ['PENDIENTE', 'EN CURSO', 'EVALUADO'];
const APPROVED_FACET_MAP = {
  approved: true,
  notapproved: false,
} as const;

export class EvaluationRepository implements IEvaluationRepository {
  private toEntity(doc: any): Evaluation {
    return {
      id: doc._id.toString(),
      uid: doc.uid.toString(),
      id_fundanet: doc.id_fundanet,
      file: doc.file,
      estado: doc.estado as EvaluationStatus,
      tipo_error: doc.tipo_error,
      aprobado: doc.aprobado,
      correo_estudiante: doc.correo_estudiante,
      version: doc.version,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private buildMongoQuery(
    userId: string,
    query: TableQueryParams,
    omittedFilters: string[] = []
  ): Record<string, unknown> {
    const mongoQuery: Record<string, unknown> = { uid: userId };

    if (!omittedFilters.includes('estado') && query.filters.estado?.length) {
      mongoQuery.estado = { $in: query.filters.estado };
    }

    if (!omittedFilters.includes('aprobado') && query.filters.aprobado?.length) {
      const approvedValues = query.filters.aprobado
        .map((value) => value.toLowerCase())
        .flatMap((value) => {
          if (value === 'approved' || value === 'true') return [true];
          if (value === 'notapproved' || value === 'false') return [false];
          return [];
        });

      if (approvedValues.length > 0) {
        mongoQuery.aprobado = { $in: approvedValues };
      }
    }

    if (query.search) {
      const normalizedSearch = query.search.trim();
      const regex = new RegExp(escapeRegex(normalizedSearch), 'i');
      const searchClauses: Record<string, unknown>[] = [
        { id_fundanet: regex },
        { correo_estudiante: regex },
        { file: regex },
        { tipo_error: regex },
      ];

      if (/^[0-9a-fA-F]{24}$/.test(normalizedSearch)) {
        searchClauses.push({ _id: normalizedSearch });
      }

      if (/^\d+$/.test(normalizedSearch)) {
        searchClauses.push({ version: Number(normalizedSearch) });
      }

      mongoQuery.$or = searchClauses;
    }

    return mongoQuery;
  }

  public async findAll(): Promise<Evaluation[]> {
    const results = await EvaluationModel.find({});
    return results.map((doc) => this.toEntity(doc));
  }

  public async findById(id: string): Promise<Evaluation | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const doc = await EvaluationModel.findById(id);
    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  public async create(data: CreateEvaluation): Promise<Evaluation> {
    const doc = await EvaluationModel.create(data);
    return this.toEntity(doc);
  }

  public async update(
    id: string,
    data: UpdateEvaluation
  ): Promise<Evaluation | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const doc = await EvaluationModel.findByIdAndUpdate(id, data, {
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

    const result = await EvaluationModel.findByIdAndDelete(id);
    return result !== null;
  }

  public async findByUserId(userId: string): Promise<Evaluation[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }

    const results = await EvaluationModel.find({ uid: userId });
    return results.map((doc) => this.toEntity(doc));
  }

  public async findByUserIdAndStoredFileName(
    userId: string,
    fileName: string
  ): Promise<Evaluation | null> {
    if (!isValidObjectId(userId) || fileName.trim().length === 0) {
      return null;
    }

    const exactUrl = buildMinioPublicFileUrl(fileName);
    const legacyPathRegex = new RegExp(`/uploads/${escapeRegex(fileName)}$`);

    const doc = await EvaluationModel.findOne({
      uid: userId,
      $or: [{ file: exactUrl }, { file: legacyPathRegex }],
    });

    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  public async findByUserIdPaginated(
    userId: string,
    query: TableQueryParams
  ): Promise<PaginatedResult<Evaluation>> {
    if (!isValidObjectId(userId)) {
      return buildPaginatedResult([], 0, query);
    }

    const mongoQuery = this.buildMongoQuery(userId, query);

    const sortField = query.sortBy ? ALLOWED_SORT_FIELDS[query.sortBy] ?? 'createdAt' : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [results, totalItems] = await Promise.all([
      EvaluationModel.find(mongoQuery)
        .sort({ [sortField]: sortOrder, _id: sortOrder })
        .skip(query.skip)
        .limit(query.pageSize),
      EvaluationModel.countDocuments(mongoQuery),
    ]);

    const items = results.map((doc) => this.toEntity(doc));

    return buildPaginatedResult(items, totalItems, query);
  }

  public async getFacetCountsByUserId(
    userId: string,
    query: TableQueryParams
  ): Promise<FacetCounts> {
    if (!isValidObjectId(userId)) {
      return {
        estado: {},
        aprobado: {},
      };
    }

    const estadoBaseQuery = this.buildMongoQuery(userId, query, ['estado']);
    const aprobadoBaseQuery = this.buildMongoQuery(userId, query, ['aprobado']);

    const estadoCountsEntries = await Promise.all(
      EVALUATION_STATUSES.map(async (status) => [
        status,
        await EvaluationModel.countDocuments({ ...estadoBaseQuery, estado: status }),
      ] as const)
    );

    const approvedCountsEntries = await Promise.all(
      Object.entries(APPROVED_FACET_MAP).map(async ([facetValue, approvedValue]) => [
        facetValue,
        await EvaluationModel.countDocuments({ ...aprobadoBaseQuery, aprobado: approvedValue }),
      ] as const)
    );

    return {
      estado: Object.fromEntries(estadoCountsEntries),
      aprobado: Object.fromEntries(approvedCountsEntries),
    };
  }

  public async findMaxVersionByFundaNet(idFundanet: string): Promise<number> {
    const docs = await EvaluationModel.find({ id_fundanet: idFundanet })
      .sort({ version: -1 })
      .limit(1)
      .select('version')
      .lean();

    if (docs.length === 0) {
      return 0;
    }

    return docs[0].version;
  }
}
