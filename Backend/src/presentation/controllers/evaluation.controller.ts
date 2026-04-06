import { NextFunction, Request, Response } from 'express';
import { CreateEvaluationDto, CreateEvaluationSchema, UpdateEvaluationDto, UpdateEvaluationSchema } from '../../application/dtos/evaluation.dto';
import { CreateEvaluationUseCase } from '../../application/useCases/evaluation/createEvaluation.useCase';
import { DeleteEvaluationUseCase } from '../../application/useCases/evaluation/deleteEvaluation.useCase';
import { GetAllEvaluationsUseCase } from '../../application/useCases/evaluation/getAllEvaluations.useCase';
import { GetEvaluationByIdUseCase } from '../../application/useCases/evaluation/getEvaluationsById.useCase';
import { GetPaginatedEvaluationsByUserUseCase } from '../../application/useCases/evaluation/getPaginatedEvaluationsByUser.useCase';
import { UpdateEvaluationUseCase } from '../../application/useCases/evaluation/updateEvaluation.useCase';
import { isValidObjectId, parseTableQuery, validateRequestBody } from '../../shared/utils';

export class EvaluationController {
  constructor(
    private readonly createEvaluationUseCase: CreateEvaluationUseCase,
    private readonly getAllEvaluationsUseCase: GetAllEvaluationsUseCase,
    private readonly getEvaluationByIdUseCase: GetEvaluationByIdUseCase,
    private readonly updateEvaluationUseCase: UpdateEvaluationUseCase,
    private readonly deleteEvaluationUseCase: DeleteEvaluationUseCase,
    private readonly getPaginatedEvaluationsByUserUseCase: GetPaginatedEvaluationsByUserUseCase
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluations = await this.getAllEvaluationsUseCase.execute();
      res.status(200).json(evaluations);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid evaluation id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const evaluation = await this.getEvaluationByIdUseCase.execute(id);
      if (!evaluation || evaluation.uid !== userId) {
        res.status(404).json({ message: 'Evaluation not found' });
        return;
      }

      res.status(200).json(evaluation);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateRequestBody(CreateEvaluationSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const dto: CreateEvaluationDto = {
        uid: req.user?.id && isValidObjectId(req.user.id) ? req.user.id : validation.data.uid,
        id_fundanet: validation.data.id_fundanet,
        file: validation.data.file,
        estado: validation.data.estado,
        tipo_error: validation.data.tipo_error,
        aprobado: validation.data.aprobado,
        correo_estudiante: validation.data.correo_estudiante,
        version: validation.data.version,
      };

      const newEvaluation = await this.createEvaluationUseCase.execute(dto);
      res.status(201).json(newEvaluation);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid evaluation id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const validation = validateRequestBody(UpdateEvaluationSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const safeData: UpdateEvaluationDto = {
        ...(validation.data.id_fundanet !== undefined && { id_fundanet: validation.data.id_fundanet }),
        ...(validation.data.estado !== undefined && { estado: validation.data.estado }),
        ...(validation.data.tipo_error !== undefined && { tipo_error: validation.data.tipo_error }),
        ...(validation.data.aprobado !== undefined && { aprobado: validation.data.aprobado }),
        ...(validation.data.correo_estudiante !== undefined && { correo_estudiante: validation.data.correo_estudiante }),
        ...(validation.data.version !== undefined && { version: validation.data.version }),
      };

      const existingEvaluation = await this.getEvaluationByIdUseCase.execute(id);
      if (!existingEvaluation || existingEvaluation.uid !== userId) {
        res.status(404).json({ message: 'Evaluation not found' });
        return;
      }

      const updatedEvaluation = await this.updateEvaluationUseCase.execute(id, safeData);
      if (!updatedEvaluation) {
        res.status(404).json({ message: 'Evaluation not found' });
        return;
      }

      res.status(200).json(updatedEvaluation);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid evaluation id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const existingEvaluation = await this.getEvaluationByIdUseCase.execute(id);
      if (!existingEvaluation || existingEvaluation.uid !== userId) {
        res.status(404).json({ message: 'Evaluation not found' });
        return;
      }

      const wasDeleted = await this.deleteEvaluationUseCase.execute(id);
      if (!wasDeleted) {
        res.status(404).json({ message: 'Evaluation not found' });
        return;
      }

      res.status(200).json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const query = parseTableQuery(req.query as Record<string, unknown>, { defaultSortBy: 'createdAt' });
      const result = await this.getPaginatedEvaluationsByUserUseCase.execute(userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
