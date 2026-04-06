import { NextFunction, Request, Response } from 'express';
import { GetPromptsByEvaluatorIdUseCase } from '../../application/useCases/prompt/getPromptsByEvaluatorId.useCase';
import { CreatePromptDto, CreatePromptSchema, UpdatePromptDto, UpdatePromptSchema } from '../../application/dtos/prompt.dto';
import { CreatePromptUseCase } from '../../application/useCases/prompt/createPrompt.useCase';
import { DeletePromptUseCase } from '../../application/useCases/prompt/deletePrompt.useCase';
import { GetAllPromptsUseCase } from '../../application/useCases/prompt/getAllPrompt.useCase';
import { GetPromptByIdUseCase } from '../../application/useCases/prompt/getPromptById.useCase';
import { ResetPromptsUseCase } from '../../application/useCases/prompt/resetPrompt.useCase';
import { UpdatePromptUseCase } from '../../application/useCases/prompt/updatePrompt.useCase';
import { isValidObjectId, validateRequestBody } from '../../shared/utils';

export class PromptController {
  constructor(
    private readonly createPromptUseCase: CreatePromptUseCase,
    private readonly getAllPromptsUseCase: GetAllPromptsUseCase,
    private readonly getPromptByIdUseCase: GetPromptByIdUseCase,
    private readonly updatePromptUseCase: UpdatePromptUseCase,
    private readonly deletePromptUseCase: DeletePromptUseCase,
    private readonly resetPromptsUseCase: ResetPromptsUseCase,
    private readonly getPromptsByEvaluatorIdUseCase: GetPromptsByEvaluatorIdUseCase
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prompts = await this.getAllPromptsUseCase.execute();
      res.status(200).json(prompts);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid prompt id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const prompt = await this.getPromptByIdUseCase.execute(id);
      if (!prompt || prompt.uid !== userId) {
        res.status(404).json({ message: 'prompt no encontrado' });
        return;
      }

      res.status(200).json(prompt);
    } catch (error) {
      next(error);
    }
  };

  public getByEvaluatorId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      if (!isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const prompts = await this.getPromptsByEvaluatorIdUseCase.execute(userId);
      res.status(200).json(prompts);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateRequestBody(CreatePromptSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const dto: CreatePromptDto = {
        uid: req.user?.id && isValidObjectId(req.user.id) ? req.user.id : validation.data.uid,
        nombre: validation.data.nombre,
        texto: validation.data.texto,
        descripcion: validation.data.descripcion,
        codigo: validation.data.codigo,
      };

      const newPrompt = await this.createPromptUseCase.execute(dto);
      res.status(201).json(newPrompt);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid prompt id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const validation = validateRequestBody(UpdatePromptSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const safeData: UpdatePromptDto = {
        ...(validation.data.nombre !== undefined && { nombre: validation.data.nombre }),
        ...(validation.data.texto !== undefined && { texto: validation.data.texto }),
        ...(validation.data.descripcion !== undefined && { descripcion: validation.data.descripcion }),
        ...(validation.data.codigo !== undefined && { codigo: validation.data.codigo }),
      };

      const existingPrompt = await this.getPromptByIdUseCase.execute(id);
      if (!existingPrompt || existingPrompt.uid !== userId) {
        res.status(404).json({ message: 'prompt no encontrado' });
        return;
      }

      const updatedPrompt = await this.updatePromptUseCase.execute(id, safeData);
      if (!updatedPrompt) {
        res.status(404).json({ message: 'prompt no encontrado' });
        return;
      }

      res.status(200).json(updatedPrompt);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid prompt id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const existingPrompt = await this.getPromptByIdUseCase.execute(id);
      if (!existingPrompt || existingPrompt.uid !== userId) {
        res.status(404).json({ message: 'prompt no encontrado' });
        return;
      }

      const wasDeleted = await this.deletePromptUseCase.execute(id);
      if (!wasDeleted) {
        res.status(404).json({ message: 'prompt no encontrado' });
        return;
      }

      res.status(200).json({ message: 'prompt eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  };

  public resetPrompts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      if (!isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      await this.resetPromptsUseCase.execute(userId);
      res.status(200).json({ message: 'Prompts reinicializados correctamente' });
    } catch (error) {
      next(error);
    }
  };
}
