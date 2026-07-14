import {
  getSelfEmployeeId,
  getTeamEmployeeIds,
} from '../auth/accessScope.js';
import { hasPermission, PERMISSIONS } from '../auth/permissions.js';
import { ROLES } from '../auth/roles.js';
import prisma from '../config/prisma.js';

function mapRecentEvaluation(evaluation) {
  return {
    id: evaluation.id,
    employeeId: evaluation.employeeId,
    employeeName: evaluation.employee.name,
    department: evaluation.employee.department,
    period: evaluation.period,
    evaluatedAt: evaluation.evaluatedAt,
    status: evaluation.status,
    isAutoEvaluation: evaluation.isAutoEvaluation,
    finalScore: evaluation.finalScore,
    classification: evaluation.classification,
  };
}

const recentInclude = {
  employee: {
    select: {
      id: true,
      name: true,
      department: true,
    },
  },
};

async function getStatsForScope(employeeWhere, evaluationWhere) {
  const [
    totalEmployees,
    activeEmployees,
    pendingEvaluations,
    completedEvaluations,
    averageResult,
    recentEvaluations,
    classificationGroups,
  ] = await Promise.all([
    prisma.employee.count({ where: employeeWhere }),
    prisma.employee.count({
      where: { ...employeeWhere, active: true },
    }),
    prisma.evaluation.count({
      where: { ...evaluationWhere, status: 'DRAFT' },
    }),
    prisma.evaluation.count({
      where: { ...evaluationWhere, status: 'COMPLETED' },
    }),
    prisma.evaluation.aggregate({
      where: {
        ...evaluationWhere,
        status: 'COMPLETED',
        finalScore: { not: null },
      },
      _avg: { finalScore: true },
    }),
    prisma.evaluation.findMany({
      where: evaluationWhere,
      take: 5,
      orderBy: { evaluatedAt: 'desc' },
      include: recentInclude,
    }),
    prisma.evaluation.groupBy({
      by: ['classification'],
      where: {
        ...evaluationWhere,
        status: 'COMPLETED',
        classification: { not: null },
      },
      _count: { classification: true },
    }),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    pendingEvaluations,
    completedEvaluations,
    averageScore: averageResult._avg.finalScore
      ? Number(averageResult._avg.finalScore.toFixed(2))
      : null,
    recentEvaluations: recentEvaluations.map(mapRecentEvaluation),
    classificationBreakdown: classificationGroups
      .filter((group) => group.classification)
      .map((group) => ({
        classification: group.classification,
        count: group._count.classification,
      })),
  };
}

async function getRhDashboard() {
  const [stats, totalTeams] = await Promise.all([
    getStatsForScope({}, {}),
    prisma.team.count(),
  ]);

  return {
    role: ROLES.RH,
    ...stats,
    totalTeams,
  };
}

async function getGerenteDashboard(user) {
  const employeeIds = await getTeamEmployeeIds(user.id);
  const employeeWhere = { id: { in: employeeIds } };
  const evaluationWhere = { employeeId: { in: employeeIds } };

  const [stats, managedTeams] = await Promise.all([
    getStatsForScope(employeeWhere, evaluationWhere),
    prisma.teamManager.findMany({
      where: { managerId: user.id },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return {
    role: ROLES.GERENTE,
    ...stats,
    managedTeams: managedTeams.map((item) => ({
      id: item.team.id,
      name: item.team.name,
      membersCount: item.team._count.members,
    })),
  };
}

async function getFuncionarioDashboard(user) {
  const employeeId = await getSelfEmployeeId(user.id);

  if (!employeeId) {
    return {
      role: ROLES.FUNCIONARIO,
      linked: false,
      lastEvaluation: null,
      lastManagerEvaluation: null,
      lastFeedback: null,
      averageScore: null,
      pendingAutoEvaluations: 0,
      completedAutoEvaluations: 0,
      completedEvaluations: 0,
      recentEvaluations: [],
      classificationBreakdown: [],
    };
  }

  const evaluationWhere = { employeeId };

  const [
    lastEvaluation,
    lastManagerEvaluation,
    averageResult,
    pendingAutoEvaluations,
    completedAutoEvaluations,
    completedEvaluations,
    recentEvaluations,
    classificationGroups,
  ] = await Promise.all([
    prisma.evaluation.findFirst({
      where: evaluationWhere,
      orderBy: { evaluatedAt: 'desc' },
      include: {
        ...recentInclude,
        finalFeedback: true,
        evaluator: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.evaluation.findFirst({
      where: {
        ...evaluationWhere,
        isAutoEvaluation: false,
        status: 'COMPLETED',
      },
      orderBy: { evaluatedAt: 'desc' },
      include: {
        finalFeedback: true,
        evaluator: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.evaluation.aggregate({
      where: {
        ...evaluationWhere,
        status: 'COMPLETED',
        finalScore: { not: null },
      },
      _avg: { finalScore: true },
    }),
    prisma.evaluation.count({
      where: {
        ...evaluationWhere,
        isAutoEvaluation: true,
        status: 'DRAFT',
      },
    }),
    prisma.evaluation.count({
      where: {
        ...evaluationWhere,
        isAutoEvaluation: true,
        status: 'COMPLETED',
      },
    }),
    prisma.evaluation.count({
      where: {
        ...evaluationWhere,
        status: 'COMPLETED',
      },
    }),
    prisma.evaluation.findMany({
      where: evaluationWhere,
      take: 8,
      orderBy: { evaluatedAt: 'desc' },
      include: recentInclude,
    }),
    prisma.evaluation.groupBy({
      by: ['classification'],
      where: {
        ...evaluationWhere,
        status: 'COMPLETED',
        classification: { not: null },
      },
      _count: { classification: true },
    }),
  ]);

  const feedbackSource = lastManagerEvaluation || lastEvaluation;
  const lastFeedback = feedbackSource?.finalFeedback
    ? {
        strengths: feedbackSource.finalFeedback.strengths,
        improvements: feedbackSource.finalFeedback.improvements,
        recommendations: feedbackSource.finalFeedback.recommendations,
        period: feedbackSource.period,
        evaluatedAt: feedbackSource.evaluatedAt,
        evaluatorName: feedbackSource.evaluator?.name ?? null,
        isAutoEvaluation: feedbackSource.isAutoEvaluation,
      }
    : null;

  return {
    role: ROLES.FUNCIONARIO,
    linked: true,
    employeeId,
    lastEvaluation: lastEvaluation
      ? {
          ...mapRecentEvaluation(lastEvaluation),
          evaluatorName: lastEvaluation.evaluator?.name ?? null,
        }
      : null,
    lastManagerEvaluation: lastManagerEvaluation
      ? {
          id: lastManagerEvaluation.id,
          period: lastManagerEvaluation.period,
          evaluatedAt: lastManagerEvaluation.evaluatedAt,
          finalScore: lastManagerEvaluation.finalScore,
          classification: lastManagerEvaluation.classification,
          evaluatorName: lastManagerEvaluation.evaluator?.name ?? null,
        }
      : null,
    lastFeedback,
    averageScore: averageResult._avg.finalScore
      ? Number(averageResult._avg.finalScore.toFixed(2))
      : null,
    pendingAutoEvaluations,
    completedAutoEvaluations,
    completedEvaluations,
    recentEvaluations: recentEvaluations.map(mapRecentEvaluation),
    classificationBreakdown: classificationGroups
      .filter((group) => group.classification)
      .map((group) => ({
        classification: group.classification,
        count: group._count.classification,
      })),
  };
}

export async function getDashboardStats(user) {
  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_ALL)) {
    return getRhDashboard();
  }

  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_TEAM)) {
    return getGerenteDashboard(user);
  }

  return getFuncionarioDashboard(user);
}
