export interface Case {
    id: string,
    uid: string,
    nombre_proyecto: string,
    fecha: Date,
    version: string,
    codigo: string,
    pdf: string,
    createdAt: Date,
    updatedAt: Date
  }

export type CreateCase = Omit<Case, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateCase = Partial<Pick<Case, 'nombre_proyecto' | 'fecha' | 'version' | 'codigo'>>


  
