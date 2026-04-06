import { PromptModel } from '../models/prompt.model';
import type { CreatePrompt, Prompt, UpdatePrompt } from '../../../domain/entities/prompt.entity';
import type { IPromptRepository } from '../../../domain/repositories/prompt.repository';
import { isValidObjectId } from '../../../shared/utils';

export class PromptRepository implements IPromptRepository {
  private toEntity(doc: any): Prompt {
    return {
      id: doc._id.toString(),
      uid: doc.uid.toString(),
      nombre: doc.nombre,
      texto: doc.texto,
      codigo: doc.codigo,
      descripcion: doc.descripcion,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  public async findAll(): Promise<Prompt[]> {
    const results = await PromptModel.find({});
    return results.map((doc) => this.toEntity(doc));
  }

  public async findById(id: string): Promise<Prompt | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const doc = await PromptModel.findById(id);
    if (!doc) {
      return null;
    }

    return this.toEntity(doc);
  }

  public async findByEvaluatorId(evaluatorId: string): Promise<Prompt[]> {
    if (!isValidObjectId(evaluatorId)) {
      return [];
    }

    const results = await PromptModel.find({ uid: evaluatorId });
    return results.map((doc) => this.toEntity(doc));
  }

  public async create(data: CreatePrompt): Promise<Prompt> {
    const doc = await PromptModel.create(data);
    return this.toEntity(doc);
  }

  public async update(id: string, data: UpdatePrompt): Promise<Prompt | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const doc = await PromptModel.findByIdAndUpdate(id, data, {
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

    const result = await PromptModel.findByIdAndDelete(id);
    return result !== null;
  }

  public async deleteByEvaluatorId(evaluationId: string): Promise<boolean> {
    if (!isValidObjectId(evaluationId)) {
      return false;
    }

    const result = await PromptModel.deleteMany({ uid: evaluationId });
    return result.deletedCount > 0;
  }
}
