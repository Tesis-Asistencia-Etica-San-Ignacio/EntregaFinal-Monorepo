import { Request, Response } from 'express';
import { UploadEvaluationFileUseCase } from '../../application/useCases/file/uploadEvaluationFile.useCase';
import { GetAllFilesUseCase } from '../../application/useCases/file/getAllFiles.useCase';
import { DownloadPdfFileUseCase } from '../../application/useCases/file/downloadPdfFile.useCase';

export class FileController {
  constructor(
    private readonly uploadEvaluationFileUseCase: UploadEvaluationFileUseCase,
    private readonly getAllFilesUseCase: GetAllFilesUseCase,
    private readonly downloadPdfFileUseCase: DownloadPdfFileUseCase
  ) {}

  public uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).send('Archivo no enviado');
    }

    try {
      const evaluatorId = req.user?.id;
      if (!evaluatorId) {
        console.error('No se pudo obtener el ID del evaluador');
        return res.status(401).json({ message: 'No se pudo obtener el ID del evaluador' });
      }

      const newEvaluation = await this.uploadEvaluationFileUseCase.execute(req.file, evaluatorId);

      return res.status(200).json({
        message: 'Archivo subido a MIN.IO y evaluación creada correctamente',
        evaluacion: newEvaluation,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al subir el archivo o crear la evaluación');
    }
  };

  public getAllFiles = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.type;
    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    try {
      const files = await this.getAllFilesUseCase.execute(userId, userRole);
      return res.status(200).json(files);
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error al obtener la lista de archivos');
    }
  };

  public downloadPdf = async (req: Request, res: Response) => {
    const { fileName } = req.params;
    if (!fileName) {
      return res.status(400).send('fileName es requerido');
    }

    const userId = req.user?.id;
    const userRole = req.user?.type;
    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    try {
      const objectStream = await this.downloadPdfFileUseCase.execute(fileName, userId, userRole);

      res.status(200).set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      });

      objectStream.pipe(res);
    } catch (err: any) {
      console.error('Error descargando PDF:', err);
      if (err.statusCode === 404) {
        return res.status(404).send('Archivo no encontrado');
      }
      if (err.code === 'NoSuchKey') {
        return res.status(404).send('Archivo no encontrado');
      }
      return res.status(500).send('Error al descargar el archivo');
    }
  };
}
