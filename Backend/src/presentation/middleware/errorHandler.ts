import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

interface CustomError extends Error {
  code?: number | string;
  statusCode?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: unknown;
}

export const errorHandlerMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('🔥 Error capturado por errorHandlerMiddleware:', err);

  let statusCode = 500;
  let message = 'Error Interno del Servidor';

  // 1) MongoDB Duplicate Key (code=11000)
  if (err.code === 11000 && err.keyValue) {
    statusCode = 409;
    const duplicatedFields = Object.keys(err.keyValue).join(', ');
    message = `Ya existe un registro con el mismo valor en el/los campo(s): ${duplicatedFields}.`
  }
  // 2) Error de validación de Mongoose
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
  }
  // 3) Error de sintaxis JSON (payload inválido)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Formato JSON inválido.';
  }
  // 4) No autorizado (JWT)
  else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Token de autenticación inválido o ausente.';
  }
  // 5) Prohibido
  else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'No tienes permiso para acceder a este recurso.';
  }
  else if (typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message;
  }
  else if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      message = 'El archivo excede el tamaño máximo permitido.';
    } else {
      statusCode = 400;
      message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
