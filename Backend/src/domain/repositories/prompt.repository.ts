import type { CreatePrompt, Prompt, UpdatePrompt } from '../entities/prompt.entity';

export interface IPromptRepository {
  findAll(): Promise<Prompt[]>;
  findById(id: string): Promise<Prompt | null>;
  findByEvaluatorId(evaluatorId: string): Promise<Prompt[]>;
  create(data: CreatePrompt): Promise<Prompt>;
  update(id: string, data: UpdatePrompt): Promise<Prompt | null>;
  delete(id: string): Promise<boolean>; 
  deleteByEvaluatorId(evaluatorId: string): Promise<boolean>;
}
