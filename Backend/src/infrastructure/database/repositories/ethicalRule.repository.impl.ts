import { Types } from 'mongoose';
import type { CreateEthicalNorm, EthicalNorm, UpdateEthicalNorm } from '../../../domain/entities/ethicalRule.entity';
import type { IEthicalNormRepository } from '../../../domain/repositories/ethicalRule.repository';
import { isValidObjectId } from '../../../shared/utils';
import { EthicalNorm as EthicalNormModel } from '../models/ethicalRule.model';

export class EthicalNormRepository implements IEthicalNormRepository {
  public async findAll(): Promise<EthicalNorm[]> {
    const norms = await EthicalNormModel.find().lean();
    return norms.map((norm) => this.toDomainEntity(norm));
  }

  public async findById(id: string): Promise<EthicalNorm | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const norm = await EthicalNormModel.findById(id).lean();
    return norm ? this.toDomainEntity(norm) : null;
  }

  public async create(data: CreateEthicalNorm): Promise<EthicalNorm> {
    const norm = await EthicalNormModel.create({
      ...data,
      evaluationId: new Types.ObjectId(data.evaluationId),
    });

    return this.toDomainEntity(norm.toObject());
  }

  public async update(
    id: string,
    data: UpdateEthicalNorm
  ): Promise<EthicalNorm | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const updateData = data.evaluationId
      ? { ...data, evaluationId: new Types.ObjectId(data.evaluationId) }
      : data;

    const norm = await EthicalNormModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return norm ? this.toDomainEntity(norm) : null;
  }

  public async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await EthicalNormModel.findByIdAndDelete(id);
    return !!result;
  }

  public async findByEvaluationId(evaluationId: string): Promise<EthicalNorm[]> {
    if (!isValidObjectId(evaluationId)) {
      return [];
    }

    const norms = await EthicalNormModel.find({
      evaluationId: new Types.ObjectId(evaluationId),
    }).lean();

    return norms.map((norm) => this.toDomainEntity(norm));
  }

  public async deleteByEvaluationId(evaluationId: string): Promise<boolean> {
    if (!isValidObjectId(evaluationId)) {
      return false;
    }

    const result = await EthicalNormModel.deleteMany({
      evaluationId: new Types.ObjectId(evaluationId),
    });

    return result.deletedCount > 0;
  }

  private toDomainEntity(norm: any): EthicalNorm {
    return {
      id: norm._id.toString(),
      evaluationId: norm.evaluationId.toString(),
      description: norm.description,
      status: norm.status,
      justification: norm.justification,
      cita: norm.cita,
      codeNumber: norm.codeNumber,
      createdAt: norm.createdAt,
      updatedAt: norm.updatedAt,
    };
  }
}
