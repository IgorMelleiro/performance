import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

const templateInclude = {
  categories: {
    orderBy: { order: 'asc' },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  },
};

export async function listActiveTemplates() {
  return prisma.evaluationTemplate.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function getTemplateById(id) {
  const template = await prisma.evaluationTemplate.findUnique({
    where: { id },
    include: templateInclude,
  });

  if (!template) {
    throw new AppError('Template de avaliação não encontrado.', 404);
  }

  if (!template.active) {
    throw new AppError('Template de avaliação inativo.', 400);
  }

  return template;
}
