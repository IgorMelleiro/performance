import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Token não fornecido.', 401));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError('Token inválido ou expirado.', 401));
  }
}
