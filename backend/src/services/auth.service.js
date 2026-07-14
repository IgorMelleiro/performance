import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import { signToken } from '../utils/jwt.js';

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return {
    token,
    user: serializeUser(user, employee?.id ?? null),
  };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      employee: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  return serializeUser(user, user.employee?.id ?? null);
}

function serializeUser(user, employeeId) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId,
    ...(user.createdAt ? { createdAt: user.createdAt } : {}),
  };
}
