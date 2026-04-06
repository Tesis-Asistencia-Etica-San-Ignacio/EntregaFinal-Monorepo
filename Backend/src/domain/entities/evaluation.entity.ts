export type EvaluationStatus = 'PENDIENTE' | 'EN CURSO' | 'EVALUADO';

export interface Evaluation {
  id: string;
  uid: string;
  id_fundanet: string;
  file: string;
  estado: EvaluationStatus;
  tipo_error: string;
  aprobado: boolean;
  correo_estudiante: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEvaluation = Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEvaluation = Partial<
  Pick<Evaluation, 'id_fundanet' | 'estado' | 'tipo_error' | 'aprobado' | 'correo_estudiante' | 'version'>
>
  
