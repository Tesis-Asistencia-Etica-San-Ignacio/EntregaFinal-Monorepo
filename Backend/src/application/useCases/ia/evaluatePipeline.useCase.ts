import { readPdfContent } from '../../../shared/utils/fileProcessor';
import { getAnalysisPrompt } from '../../prompts/analisis.prompt';
import { parseJson } from '../../../shared/utils/jsonParser';
import { IaOptionsDto } from '../../dtos/ia.dto';
import type { IFileStorage } from '../../ports/file-storage.port';
import { CreateEthicalRulesUseCase } from '../ethical_rules/createEthicalRules.useCase';
import { DeleteEthicalRulesByEvaluationIdUseCase } from '../ethical_rules/deleteEthicalRulesByEvaluationId.useCase';
import { GetEvaluationByIdUseCase } from '../evaluation/getEvaluationsById.useCase';
import { GetEvaluationsByUserUseCase } from '../evaluation/getEvaluationsByUser.useCase';
import { GenerateCompletionUseCase } from './generateCompletion.useCase';
import { GetPromptsByEvaluatorIdUseCase } from '../prompt/getPromptsByEvaluatorId.useCase';
import { UpdateEvaluationUseCase } from '../evaluation/updateEvaluation.useCase';

interface EvaluatePipelineDto {
  evaluatorId: string;
  evaluationId: string;
  cleanNormsBefore: boolean;
  model: string;
  provider: string;
}

export class EvaluatePipelineUseCase {
  constructor(
    private readonly getEvalById: GetEvaluationByIdUseCase,
    private readonly getEvalsByUser: GetEvaluationsByUserUseCase,
    private readonly getPrompts: GetPromptsByEvaluatorIdUseCase,
    private readonly generateLLM: GenerateCompletionUseCase,
    private readonly deleteNorms: DeleteEthicalRulesByEvaluationIdUseCase,
    private readonly createNorms: CreateEthicalRulesUseCase,
    private readonly updateEval: UpdateEvaluationUseCase,
    private readonly fileStorage: IFileStorage
  ) {}

  public async execute(dto: EvaluatePipelineDto): Promise<void> {
    try {
      const { evaluatorId, evaluationId, cleanNormsBefore, model, provider } = dto;

      const evalsUser = await this.getEvalsByUser.execute(evaluatorId);
      const exists = evalsUser.some((evaluation) => evaluation.id.toString() === evaluationId);
      if (!exists) {
        throw new Error('Evaluación no encontrada para el usuario');
      }

      const evaluation = await this.getEvalById.execute(evaluationId);
      if (!evaluation) {
        throw new Error('Evaluación no encontrada');
      }
      if (!cleanNormsBefore && evaluation.estado !== 'PENDIENTE') {
        throw new Error('La evaluación ya fue procesada');
      }
      if (
        cleanNormsBefore &&
        !(evaluation.estado === 'EN CURSO' || evaluation.estado === 'EVALUADO')
      ) {
        throw new Error('Solo se puede re-evaluar si la evaluación está EN CURSO o EVALUADO');
      }

      const fileName = evaluation.file.split('/').pop() || '';
      const fileBuffer = await this.fileStorage.getBuffer(fileName);
      const fileContent = fileName.endsWith('.pdf')
        ? await readPdfContent(fileBuffer)
        : fileBuffer.toString();

      const prompts = await this.getPrompts.execute(evaluatorId);
      if (!prompts) {
        throw new Error('Prompts no encontrados para el evaluador');
      }

      const { system, user } = getAnalysisPrompt(fileContent, prompts, provider);
      const IaMessage: IaOptionsDto = {
        model,
        systemInstruction: system,
        contents: user,
        responseType: { type: 'json_object' },
        temperature: 0.1,
        pdfBuffer: fileBuffer,
      };

      const completion = await this.generateLLM.execute(IaMessage, provider);
      if (!completion) {
        throw new Error('Sin respuesta del modelo');
      }

      const parsed = parseJson(completion);
      if (typeof parsed !== 'object' || !parsed.analysis) {
        throw new Error('Formato JSON inválido');
      }

      if (cleanNormsBefore) {
        await this.deleteNorms.execute(evaluation.id);
      }

      await this.createNorms.crearNormasEticasBase(evaluation.id, parsed.analysis);
      await this.updateEval.execute(evaluation.id, { estado: 'EN CURSO' });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
