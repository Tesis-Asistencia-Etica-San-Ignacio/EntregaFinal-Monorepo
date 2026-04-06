export interface Prompt {
    id: string;
    uid: string;
    nombre: string;
    texto: string;
    codigo: string;
    descripcion: string;
    createdAt: Date;
    updatedAt: Date;
  }

export type CreatePrompt = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePrompt = Partial<Pick<Prompt, 'nombre' | 'texto' | 'descripcion' | 'codigo'>>
  
