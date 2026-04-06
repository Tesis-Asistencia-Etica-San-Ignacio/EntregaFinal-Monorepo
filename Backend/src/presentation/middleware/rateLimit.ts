import { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
  keyPrefix: string;
  resolveKey?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const cleanupExpiredEntries = (now: number) => {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
};

export const createRateLimitMiddleware = ({
  windowMs,
  max,
  message,
  keyPrefix,
  resolveKey,
}: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const now = Date.now();
    const identifier = resolveKey?.(req) ?? req.ip;
    const key = `${keyPrefix}:${identifier}`;

    cleanupExpiredEntries(now);

    const current = rateLimitStore.get(key);

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({ message });
      return;
    }

    current.count += 1;
    next();
  };
};

const resolveUserOrIp = (req: Request) => req.user?.id ?? req.ip;

export const apiRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.',
  keyPrefix: 'api',
});

export const authRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de autenticacion. Intenta nuevamente en unos minutos.',
  keyPrefix: 'auth',
});

export const uploadRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiadas cargas de archivos. Intenta nuevamente en unos minutos.',
  keyPrefix: 'upload',
  resolveKey: resolveUserOrIp,
});

export const heavyOperationRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiadas operaciones seguidas. Intenta nuevamente en unos minutos.',
  keyPrefix: 'heavy',
  resolveKey: resolveUserOrIp,
});

export const emailRateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados correos enviados. Intenta nuevamente en unos minutos.',
  keyPrefix: 'email',
  resolveKey: resolveUserOrIp,
});
