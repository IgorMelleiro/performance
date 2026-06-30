import prisma from '../config/prisma.js';

export async function getDashboardStats() {
  const [
    totalEmployees,
    activeEmployees,
    pendingEvaluations,
    completedEvaluations,
    averageResult,
    recentEvaluations,
    classificationGroups,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { active: true } }),
    prisma.evaluation.count({ where: { status: 'DRAFT' } }),
    prisma.evaluation.count({ where: { status: 'COMPLETED' } }),
    prisma.evaluation.aggregate({
      where: {
        status: 'COMPLETED',
        finalScore: { not: null },
      },
      _avg: { finalScore: true },
    }),
    prisma.evaluation.findMany({
      take: 5,
      orderBy: { evaluatedAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    }),
    prisma.evaluation.groupBy({
      by: ['classification'],
      where: {
        status: 'COMPLETED',
        classification: { not: null },
      },
      _count: { classification: true },
    }),
  ]);

  const averageScore = averageResult._avg.finalScore
    ? Number(averageResult._avg.finalScore.toFixed(2))
    : null;

  return {
    totalEmployees,
    activeEmployees,
    pendingEvaluations,
    completedEvaluations,
    averageScore,
    recentEvaluations: recentEvaluations.map((evaluation) => ({
      id: evaluation.id,
      employeeId: evaluation.employeeId,
      employeeName: evaluation.employee.name,
      department: evaluation.employee.department,
      period: evaluation.period,
      evaluatedAt: evaluation.evaluatedAt,
      status: evaluation.status,
      finalScore: evaluation.finalScore,
      classification: evaluation.classification,
    })),
    classificationBreakdown: classificationGroups
      .filter((group) => group.classification)
      .map((group) => ({
        classification: group.classification,
        count: group._count.classification,
      })),
  };
}
