import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRateLimitMiddleware } from './rateLimit';

dotenv.config();

export const configureMiddlewares = (app: express.Application) => {
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(apiRateLimitMiddleware);
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Pdf-Id'],
      exposedHeaders: ['X-Pdf-Id'],
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.use((req, res, next) => {
    req.setTimeout(60000, () => {
      console.log('Tiempo de espera agotado en la solicitud.');
      res.status(408).send('Timeout en la solicitud.');
    });
    next();
  });
};
