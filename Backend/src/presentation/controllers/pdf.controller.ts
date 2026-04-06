import { Request, Response } from 'express';
import { CreateCaseRequestPayloadSchema } from '../../application/dtos/case.dto';
import { EvaluateRequestSchema } from '../../application/dtos/ia.dto';
import { GetEthicalRulesByEvaluationUseCase } from '../../application/useCases/ethical_rules/getEthicalRulesByEvaluation.useCase';
import { GetEvaluationByIdUseCase } from '../../application/useCases/evaluation/getEvaluationsById.useCase';
import { PreviewPdfUseCase } from '../../application/useCases/pdf/previewPdf.useCase';
import { validateRequestBody } from '../../shared/utils';

export class PdfController {
  constructor(
    private readonly previewPdf: PreviewPdfUseCase,
    private readonly getNorms: GetEthicalRulesByEvaluationUseCase,
    private readonly getEval: GetEvaluationByIdUseCase
  ) {}

  public async previewEvaluatorPdf(req: Request, res: Response): Promise<void> {
    const validation = validateRequestBody(EvaluateRequestSchema, req.body);
    if (!validation.success) {
      res.status(400).send(validation.message);
      return;
    }

    const userId = req.user?.id;

    try {
      const evaluation = await this.getEval.execute(validation.data.evaluationId);
      if (!userId) {
        res.status(401).send('Usuario no autenticado');
        return;
      }
      if (!evaluation || evaluation.uid !== userId) {
        res.status(404).send('Evaluación no encontrada');
        return;
      }

      const norms = await this.getNorms.execute(validation.data.evaluationId);
      const version = evaluation.version ?? 1;

      const { buf, pdfId } = await this.previewPdf.execute('ethicalNormsReport', {
        norms,
        date: new Date().toLocaleDateString('es-CO'),
        version,
      });

      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Length': buf.length.toString(),
          'X-Pdf-Id': pdfId,
          'Access-Control-Expose-Headers': 'X-Pdf-Id',
        })
        .send(buf);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generando PDF de evaluador');
    }
  }

  public async previewInvestigatorPdf(req: Request, res: Response): Promise<void> {
    const validation = validateRequestBody(CreateCaseRequestPayloadSchema, req.body);
    if (!validation.success) {
      res.status(400).send(validation.message);
      return;
    }

    try {
      const previewPayload = {
        ...(req.body as Record<string, unknown>),
        nombre_proyecto: validation.data.nombre_proyecto,
        fecha: String(validation.data.fecha),
        version: String(validation.data.version),
        codigo: validation.data.codigo,
      };

      const { buf, pdfId } = await this.previewPdf.execute('pdfConsentTemplate', {
        data: previewPayload,
        date: new Date().toLocaleDateString('es-CO'),
      });

      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Length': buf.length.toString(),
          'X-Pdf-Id': pdfId,
          'Access-Control-Expose-Headers': 'X-Pdf-Id',
        })
        .send(buf);
    } catch (err) {
      console.error('Error en previewInvestigatorPdf:', err);
      res.status(500).send('Error generando PDF de investigador');
    }
  }
}
