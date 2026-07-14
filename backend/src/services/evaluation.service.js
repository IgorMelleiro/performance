import {
  assertCanAccessEvaluation,
  assertCanCreateEvaluation,
  assertCanDeleteEvaluation,
  assertCanMutateEvaluation,
  buildEvaluationAccessWhere,
  getSelfEmployeeId,
} from '../auth/accessScope.js';
import { hasPermission, PERMISSIONS } from '../auth/permissions.js';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  calculateEvaluationSummary,
} from '../utils/evaluationCalculator.js';
import { getTemplateById } from './template.service.js';

const evaluationInclude = {
  employee: {
    select: {
      id: true,
      name: true,
      position: true,
      department: true,
      active: true,
    },
  },
  template: {
    select: {
      id: true,
      name: true,
    },
  },
  evaluator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const evaluationDetailInclude = {
  employee: {
    select: {
      id: true,
      name: true,
      position: true,
      department: true,
      active: true,
    },
  },
  template: {
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  },
  evaluator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  answers: true,
  categoryComments: true,
  finalFeedback: true,
};

function buildListWhere({ search, status }) {
  const where = {};

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { period: { contains: term, mode: 'insensitive' } },
      { employee: { name: { contains: term, mode: 'insensitive' } } },
      { classification: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (status === 'DRAFT' || status === 'COMPLETED') {
    where.status = status;
  }

  return where;
}

function mapEvaluationListItem(evaluation) {
  return {
    id: evaluation.id,
    employeeId: evaluation.employeeId,
    templateId: evaluation.templateId,
    period: evaluation.period,
    evaluatedAt: evaluation.evaluatedAt,
    status: evaluation.status,
    isAutoEvaluation: evaluation.isAutoEvaluation,
    finalScore: evaluation.finalScore,
    classification: evaluation.classification,
    createdAt: evaluation.createdAt,
    updatedAt: evaluation.updatedAt,
    employee: evaluation.employee,
    template: evaluation.template,
    evaluator: evaluation.evaluator,
  };
}

function validateScore(score) {
  const parsedScore = Number(score);

  if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 5) {
    throw new AppError('Cada nota deve ser um número inteiro entre 1 e 5.', 400);
  }

  return parsedScore;
}

async function ensureDraftEvaluation(id) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      template: {
        include: {
          categories: {
            include: { questions: true },
          },
        },
      },
      answers: true,
      categoryComments: true,
      finalFeedback: true,
    },
  });

  if (!evaluation) {
    throw new AppError('Avaliação não encontrada.', 404);
  }

  if (evaluation.status !== 'DRAFT') {
    throw new AppError('Somente avaliações em rascunho podem ser editadas.', 409);
  }

  return evaluation;
}

async function saveEvaluationData(tx, evaluationId, payload) {
  if (payload.answers?.length) {
    for (const answer of payload.answers) {
      await tx.evaluationAnswer.upsert({
        where: {
          evaluationId_questionId: {
            evaluationId,
            questionId: answer.questionId,
          },
        },
        create: {
          evaluationId,
          questionId: answer.questionId,
          score: validateScore(answer.score),
          comment: answer.comment?.trim() || null,
        },
        update: {
          score: validateScore(answer.score),
          comment: answer.comment?.trim() || null,
        },
      });
    }
  }

  if (payload.categoryComments?.length) {
    for (const categoryComment of payload.categoryComments) {
      if (!categoryComment.comment?.trim()) {
        continue;
      }

      await tx.categoryComment.upsert({
        where: {
          evaluationId_categoryId: {
            evaluationId,
            categoryId: categoryComment.categoryId,
          },
        },
        create: {
          evaluationId,
          categoryId: categoryComment.categoryId,
          comment: categoryComment.comment.trim(),
        },
        update: {
          comment: categoryComment.comment.trim(),
        },
      });
    }
  }

  if (payload.finalFeedback) {
    await tx.finalFeedback.upsert({
      where: { evaluationId },
      create: {
        evaluationId,
        strengths: payload.finalFeedback.strengths.trim(),
        improvements: payload.finalFeedback.improvements.trim(),
        recommendations: payload.finalFeedback.recommendations.trim(),
      },
      update: {
        strengths: payload.finalFeedback.strengths.trim(),
        improvements: payload.finalFeedback.improvements.trim(),
        recommendations: payload.finalFeedback.recommendations.trim(),
      },
    });
  }
}

export async function listEvaluations(
  { page = 1, limit = 10, search, status },
  user,
) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;
  const accessWhere = await buildEvaluationAccessWhere(user);
  const filtersWhere = buildListWhere({ search, status });
  const where = {
    AND: [accessWhere, filtersWhere].filter(
      (clause) => Object.keys(clause).length > 0,
    ),
  };

  const [evaluations, total] = await Promise.all([
    prisma.evaluation.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { evaluatedAt: 'desc' },
      include: evaluationInclude,
    }),
    prisma.evaluation.count({ where }),
  ]);

  return {
    data: evaluations.map(mapEvaluationListItem),
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getEvaluationById(id, user) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: evaluationDetailInclude,
  });

  if (!evaluation) {
    throw new AppError('Avaliação não encontrada.', 404);
  }

  if (user) {
    await assertCanAccessEvaluation(user, evaluation);
  }

  return evaluation;
}

export async function createEvaluation(data, user) {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });

  if (!employee) {
    throw new AppError('Colaborador não encontrado.', 404);
  }

  if (!employee.active) {
    throw new AppError('Colaborador inativo não pode ser avaliado.', 400);
  }

  const createOptions = await assertCanCreateEvaluation(user, data.employeeId);

  await getTemplateById(data.templateId);

  if (!data.period?.trim()) {
    throw new AppError('Período avaliado é obrigatório.', 400);
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      employeeId: data.employeeId,
      templateId: data.templateId,
      evaluatorId: user.id,
      period: data.period.trim(),
      evaluatedAt: data.evaluatedAt ? new Date(data.evaluatedAt) : new Date(),
      status: 'DRAFT',
      isAutoEvaluation: createOptions.isAutoEvaluation,
    },
    include: evaluationDetailInclude,
  });

  return evaluation;
}

/**
 * Cria autoavaliação do funcionário autenticado (sempre isAutoEvaluation=true).
 */
export async function createSelfEvaluation(data, user) {
  if (!hasPermission(user.role, PERMISSIONS.EVALUATIONS_CREATE_SELF)) {
    throw new AppError('Acesso negado.', 403);
  }

  const employeeId = await getSelfEmployeeId(user.id);

  if (!employeeId) {
    throw new AppError(
      'Sua conta ainda não está vinculada a um colaborador. Solicite ao RH.',
      400,
    );
  }

  let templateId = data.templateId;

  if (!templateId) {
    const template = await prisma.evaluationTemplate.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!template) {
      throw new AppError('Nenhum template de avaliação disponível.', 400);
    }

    templateId = template.id;
  }

  return createEvaluation(
    {
      employeeId,
      templateId,
      period: data.period,
      evaluatedAt: data.evaluatedAt,
    },
    user,
  );
}

export async function updateEvaluation(id, payload, user) {
  const evaluation = await ensureDraftEvaluation(id);
  await assertCanMutateEvaluation(user, evaluation);

  await prisma.$transaction(async (tx) => {
    if (payload.period || payload.evaluatedAt) {
      await tx.evaluation.update({
        where: { id },
        data: {
          period: payload.period?.trim() || evaluation.period,
          evaluatedAt: payload.evaluatedAt
            ? new Date(payload.evaluatedAt)
            : evaluation.evaluatedAt,
        },
      });
    }

    await saveEvaluationData(tx, id, payload);
  });

  return getEvaluationById(id, user);
}

export async function completeEvaluation(id, user) {
  const evaluation = await ensureDraftEvaluation(id);
  await assertCanMutateEvaluation(user, evaluation);

  const template = await getTemplateById(evaluation.templateId);
  const allQuestions = template.categories.flatMap(
    (category) => category.questions,
  );

  const answers = await prisma.evaluationAnswer.findMany({
    where: { evaluationId: id },
  });

  const missingQuestions = allQuestions.filter(
    (question) => !answers.some((answer) => answer.questionId === question.id),
  );

  if (missingQuestions.length > 0) {
    throw new AppError(
      'Responda todas as perguntas antes de concluir a avaliação.',
      400,
    );
  }

  const finalFeedback = await prisma.finalFeedback.findUnique({
    where: { evaluationId: id },
  });

  if (
    !finalFeedback?.strengths?.trim() ||
    !finalFeedback?.improvements?.trim() ||
    !finalFeedback?.recommendations?.trim()
  ) {
    throw new AppError(
      'Preencha o feedback final antes de concluir a avaliação.',
      400,
    );
  }

  const summary = calculateEvaluationSummary(template, answers);

  return prisma.evaluation.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      finalScore: summary.finalScore,
      classification: summary.classification,
    },
    include: evaluationDetailInclude,
  });
}

export async function deleteEvaluation(id, user) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
  });

  if (!evaluation) {
    throw new AppError('Avaliação não encontrada.', 404);
  }

  await assertCanDeleteEvaluation(user, evaluation);

  if (evaluation.status !== 'DRAFT') {
    throw new AppError('Somente rascunhos podem ser excluídos.', 409);
  }

  await prisma.evaluation.delete({ where: { id } });

  return { message: 'Avaliação excluída com sucesso.' };
}

export async function getEvaluationSummary(id, user) {
  const evaluation = await getEvaluationById(id, user);
  const summary = calculateEvaluationSummary(
    evaluation.template,
    evaluation.answers,
  );

  return {
    evaluationId: evaluation.id,
    status: evaluation.status,
    ...summary,
  };
}
