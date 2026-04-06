import { Request, Response } from 'express';
import { EvaluateRequestSchema, ModifyProviderApiKeySchema } from '../../application/dtos/ia.dto';
import { ModifyProviderApiKeyUseCase } from '../../application/useCases/ia/modifyProviderApiKey.useCase';
import { ObtainModelsUseCase } from '../../application/useCases/ia/obtainModels.useCase';
import { RunEvaluationUseCase } from '../../application/useCases/ia/runEvaluation.useCase';
import { RunReEvaluationUseCase } from '../../application/useCases/ia/runReEvaluation.useCase';
import { isValidObjectId, validateRequestBody } from '../../shared/utils';

export class IAController {
  constructor(
    private readonly runEvaluationUseCase: RunEvaluationUseCase,
    private readonly runReEvaluationUseCase: RunReEvaluationUseCase,
    private readonly obtainModelsUseCase: ObtainModelsUseCase,
    private readonly modifyProviderApiKeyUseCase: ModifyProviderApiKeyUseCase
  ) {}

  private buildIaErrorResponse(error: unknown): { status: number; message: string } {
    const rawMessage = error instanceof Error ? error.message : 'Error';
    const normalized = rawMessage.toLowerCase();

    if (
      normalized.includes('413') ||
      normalized.includes('request too large') ||
      normalized.includes('message size') ||
      normalized.includes('too large for model')
    ) {
      return {
        status: 413,
        message:
          'La solicitud es demasiado grande para el modelo seleccionado. Prueba con otro modelo o vuelve a intentarlo en unos segundos.',
      };
    }

    if (
      normalized.includes('quota exceeded') ||
      normalized.includes('too many requests') ||
      normalized.includes('resource_exhausted') ||
      normalized.includes('429') ||
      normalized.includes('rate_limit_exceeded') ||
      normalized.includes('tokens per minute') ||
      normalized.includes('please try again in')
    ) {
      return {
        status: 429,
        message:
          'Se alcanzó temporalmente el límite del proveedor de IA. Espera un momento o cambia de proveedor/modelo.',
      };
    }

    return {
      status: 500,
      message: rawMessage,
    };
  }

  public evaluate = async (req: Request, res: Response) => {
    const validation = validateRequestBody(EvaluateRequestSchema, req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    if (!req.user?.id || !isValidObjectId(req.user.id)) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    try {
      await this.runEvaluationUseCase.execute({
        evaluatorId: req.user.id,
        evaluationId: validation.data.evaluationId,
      });

      res.json({ success: true, message: 'Evaluación procesada con éxito' });
    } catch (error: unknown) {
      const iaError = this.buildIaErrorResponse(error);
      res.status(iaError.status).json({ success: false, message: iaError.message });
    }
  };

  public reEvaluate = async (req: Request, res: Response) => {
    const validation = validateRequestBody(EvaluateRequestSchema, req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    if (!req.user?.id || !isValidObjectId(req.user.id)) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    try {
      await this.runReEvaluationUseCase.execute({
        evaluatorId: req.user.id,
        evaluationId: validation.data.evaluationId,
      });

      res.json({ success: true, message: 'Re-evaluación exitosa' });
    } catch (error: unknown) {
      const iaError = this.buildIaErrorResponse(error);
      res.status(iaError.status).json({ success: false, message: iaError.message });
    }
  };

  public getModels = async (_req: Request, res: Response) => {
    try {
      const models = await this.obtainModelsUseCase.execute();
      res.json({ success: true, models });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error',
      });
    }
  };

  public modifyApiKey = async (req: Request, res: Response) => {
    const validation = validateRequestBody(ModifyProviderApiKeySchema, req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    try {
      const result = await this.modifyProviderApiKeyUseCase.execute(
        validation.data.provider,
        validation.data.apiKey
      );

      res.json({ success: true, message: `API key para ${result} actualizada con éxito` });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error',
      });
    }
  };
}
