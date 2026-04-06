import { NextFunction, Request, Response } from 'express';
import {
  CreateCaseRequestDto,
  CreateCaseRequestPayloadSchema,
  UpdateCaseDto,
  UpdateCaseSchema,
} from '../../application/dtos/case.dto';
import {
  CreateCaseFromPreviewUseCase,
  DeleteCaseUseCase,
  GetAllCasesUseCase,
  GetCaseByIdUseCase,
  GetPaginatedCasesByUserIdUseCase,
  UpdateCaseUseCase,
} from '../../application/useCases/case';
import { isValidObjectId, parseTableQuery, validateRequestBody } from '../../shared/utils';

export class CaseController {
  constructor(
    private readonly createCaseFromPreviewUseCase: CreateCaseFromPreviewUseCase,
    private readonly getAllCasesUseCase: GetAllCasesUseCase,
    private readonly getCaseByIdUseCase: GetCaseByIdUseCase,
    private readonly updateCaseUseCase: UpdateCaseUseCase,
    private readonly deleteCaseUseCase: DeleteCaseUseCase,
    private readonly getPaginatedCasesByUserIdUseCase: GetPaginatedCasesByUserIdUseCase
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cases = await this.getAllCasesUseCase.execute();
      res.status(200).json(cases);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid case id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const caseData = await this.getCaseByIdUseCase.execute(id);
      if (!caseData || caseData.uid !== userId) {
        res.status(404).json({ message: 'Caso no encontrado' });
        return;
      }

      res.status(200).json(caseData);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateRequestBody(CreateCaseRequestPayloadSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const pdfId = req.header('X-Pdf-Id');
      if (!pdfId) {
        res.status(400).json({ success: false, message: 'Falta el identificador del PDF (X-Pdf-Id)' });
        return;
      }

      const userId = req.user?.id;
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const body: CreateCaseRequestDto = {
        nombre_proyecto: validation.data.nombre_proyecto,
        fecha: String(validation.data.fecha),
        version: String(validation.data.version),
        codigo: validation.data.codigo,
      };

      try {
        const newCase = await this.createCaseFromPreviewUseCase.execute(userId, pdfId, body);
        res.status(201).json({ success: true, data: newCase });
      } catch (error) {
        if (error instanceof Error && error.message === 'PREVIEW_PDF_NOT_FOUND') {
          res.status(410).json({ success: false, message: 'PDF expirado o no encontrado' });
          return;
        }
        throw error;
      }
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid case id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const validation = validateRequestBody(UpdateCaseSchema, req.body);
      if (!validation.success) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const safeData: UpdateCaseDto = {
        ...(validation.data.nombre_proyecto !== undefined && { nombre_proyecto: validation.data.nombre_proyecto }),
        ...(validation.data.fecha !== undefined && { fecha: validation.data.fecha }),
        ...(validation.data.version !== undefined && { version: validation.data.version }),
        ...(validation.data.codigo !== undefined && { codigo: validation.data.codigo }),
      };

      const existingCase = await this.getCaseByIdUseCase.execute(id);
      if (!existingCase || existingCase.uid !== userId) {
        res.status(404).json({ message: 'Caso no encontrado' });
        return;
      }

      const updatedCase = await this.updateCaseUseCase.execute(id, safeData);
      if (!updatedCase) {
        res.status(404).json({ message: 'Caso no encontrado' });
        return;
      }

      res.status(200).json(updatedCase);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid case id' });
        return;
      }
      if (!userId || !isValidObjectId(userId)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const existingCase = await this.getCaseByIdUseCase.execute(id);
      if (!existingCase || existingCase.uid !== userId) {
        res.status(404).json({ message: 'Caso no encontrado' });
        return;
      }

      const wasDeleted = await this.deleteCaseUseCase.execute(id);
      if (!wasDeleted) {
        res.status(404).json({ message: 'Caso no encontrado' });
        return;
      }

      res.status(200).json({ message: 'Caso eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  };

  public getMyCases = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !isValidObjectId(req.user.id)) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const query = parseTableQuery(req.query as Record<string, unknown>, { defaultSortBy: 'createdAt' });
      const result = await this.getPaginatedCasesByUserIdUseCase.execute(req.user.id, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
