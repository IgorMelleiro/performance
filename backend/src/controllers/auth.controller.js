import * as authService from '../services/auth.service.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      throw new AppError('E-mail e senha são obrigatórios.', 400);
    }

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
