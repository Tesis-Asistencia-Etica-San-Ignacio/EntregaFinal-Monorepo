import { NextFunction, Request, Response } from 'express';
import { CreateEthicalNormDto, CreateEthicalNormSchema, UpdateEthicalNormDto, UpdateEthicalNormSchema } from '../../application/dtos/ethicalRule.dto';
import { CreateEthicalRuleUseCase } from '../../application/useCases/ethical_rules/createEthicalRule.useCase';
import { DeleteEthicalRuleUseCase } from '../../application/useCases/ethical_rules/deleteEthicalRule.useCase';
import { GetAllEthicalRulesUseCase } from '../../application/useCases/ethical_rules/getAllEthicalRules.useCase';
import { GetEthicalRuleByIdUseCase } from '../../application/useCases/ethical_rules/getEthicalRuleById.useCase';
import { GetEthicalRulesByEvaluationUseCase } from '../../application/useCases/ethical_rules/getEthicalRulesByEvaluation.useCase';
import { UpdateEthicalRuleUseCase } from '../../application/useCases/ethical_rules/updateEthicalRule.useCase';
import { GetEvaluationByIdUseCase } from '../../application/useCases/evaluation/getEvaluationsById.useCase';
import { isValidObjectId, validateRequestBody } from '../../shared/utils';

export class EthicalNormController {
  constructor(
    private readonly createUseCase: CreateEthicalRuleUseCase,
    private readonly getAllUseCase: GetAllEthicalRulesUseCase,
    private readonly getByIdUseCase: GetEthicalRuleByIdUseCase,
    private readonly getByEvaluationUseCase: GetEthicalRulesByEvaluationUseCase,
    private readonly getEvaluationByIdUseCase: GetEvaluationByIdUseCase,
    private readonly updateUseCase: UpdateEthicalRuleUseCase,
    private readonly deleteUseCase: DeleteEthicalRuleUseCase
  ) {}

  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validation = validateRequestBody(CreateEthicalNormSchema, req.body);
      const userId = req.user?.id;
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const evaluation = await this.getEvaluationByIdUseCase.execute(validation.data.evaluationId);
      if (!evaluation || evaluation.uid !== userId) {
        res.status(404).json({ message: 'Evaluación no encontrada' });
        return;
      }

      const dto: CreateEthicalNormDto = {
        evaluationId: validation.data.evaluationId,
        description: validation.data.description,
        status: validation.data.status,
        justification: validation.data.justification,
        cita: validation.data.cita,
        codeNumber: validation.data.codeNumber,
      };

      const newNorm = await this.createUseCase.execute(dto);
      res.status(201).json(newNorm);
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const norms = await this.getAllUseCase.execute();
      res.status(200).json(norms);
    } catch (error) {
      next(error);
    }
  };

  public getByEvaluation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { evaluationId } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(evaluationId)) {
        res.status(400).json({ message: 'Invalid evaluation id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const evaluation = await this.getEvaluationByIdUseCase.execute(evaluationId);
      if (!evaluation || evaluation.uid !== userId) {
        res.status(404).json({ message: 'Evaluación no encontrada' });
        return;
      }

      const norms = await this.getByEvaluationUseCase.execute(evaluationId);
      res.status(200).json(norms);
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid ethical rule id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const validation = validateRequestBody(UpdateEthicalNormSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const existingNorm = await this.getByIdUseCase.execute(id);
      if (!existingNorm) {
        res.status(404).json({ message: 'Norma ética no encontrada' });
        return;
      }

      const evaluation = await this.getEvaluationByIdUseCase.execute(existingNorm.evaluationId);
      if (!evaluation || evaluation.uid !== userId) {
        res.status(404).json({ message: 'Norma ética no encontrada' });
        return;
      }

      const dto: UpdateEthicalNormDto = {
        ...(validation.data.evaluationId !== undefined && { evaluationId: validation.data.evaluationId }),
        ...(validation.data.description !== undefined && { description: validation.data.description }),
        ...(validation.data.status !== undefined && { status: validation.data.status }),
        ...(validation.data.justification !== undefined && { justification: validation.data.justification }),
        ...(validation.data.cita !== undefined && { cita: validation.data.cita }),
        ...(validation.data.codeNumber !== undefined && { codeNumber: validation.data.codeNumber }),
      };

      const updatedNorm = await this.updateUseCase.execute(id, dto);
      if (!updatedNorm) {
        res.status(404).json({ message: 'Norma Ã©tica no encontrada' });
        return;
      }

      res.status(200).json(updatedNorm);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid ethical rule id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const existingNorm = await this.getByIdUseCase.execute(id);
      if (!existingNorm) {
        res.status(404).json({ message: 'Norma ética no encontrada' });
        return;
      }

      const evaluation = await this.getEvaluationByIdUseCase.execute(existingNorm.evaluationId);
      if (!evaluation || evaluation.uid !== userId) {
        res.status(404).json({ message: 'Norma ética no encontrada' });
        return;
      }

      const success = await this.deleteUseCase.execute(id);
      if (!success) {
        res.status(404).json({ message: 'Norma Ã©tica no encontrada' });
        return;
      }

      res.status(200).json({ message: 'Norma eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  };
}
