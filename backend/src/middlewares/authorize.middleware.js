import { hasAllPermissions, hasAnyPermission } from '../auth/permissions.js';
import { isValidRole } from '../auth/roles.js';
import { AppError } from './errorHandler.js';

/**
 * Exige que o usuário autenticado tenha ao menos uma das permissões informadas.
 */
export function authorize(...permissions) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Não autenticado.', 401));
    }

    if (!isValidRole(req.user.role)) {
      return next(new AppError('Papel de usuário inválido.', 403));
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return next(new AppError('Acesso negado.', 403));
    }

    return next();
  };
}

/**
 * Exige que o usuário autenticado tenha todas as permissões informadas.
 */
export function authorizeAll(...permissions) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Não autenticado.', 401));
    }

    if (!isValidRole(req.user.role)) {
      return next(new AppError('Papel de usuário inválido.', 403));
    }

    if (!hasAllPermissions(req.user.role, permissions)) {
      return next(new AppError('Acesso negado.', 403));
    }

    return next();
  };
}

/**
 * Exige que o usuário autenticado tenha um dos papéis informados.
 */
export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Não autenticado.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Acesso negado.', 403));
    }

    return next();
  };
}
