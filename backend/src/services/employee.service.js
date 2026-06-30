import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

function buildWhere({ search, department, active }) {
  const where = {};

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { position: { contains: term, mode: 'insensitive' } },
      { department: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (department?.trim()) {
    where.department = { equals: department.trim(), mode: 'insensitive' };
  }

  if (active === 'true') {
    where.active = true;
  }

  if (active === 'false') {
    where.active = false;
  }

  return where;
}

function mapEmployee(employee) {
  const lastEvaluation = employee.evaluations?.[0] ?? null;

  return {
    id: employee.id,
    name: employee.name,
    position: employee.position,
    department: employee.department,
    active: employee.active,
    createdAt: employee.createdAt,
    lastEvaluation: lastEvaluation
      ? {
          id: lastEvaluation.id,
          date: lastEvaluation.evaluatedAt,
          status: lastEvaluation.status,
          classification: lastEvaluation.classification,
          finalScore: lastEvaluation.finalScore,
        }
      : null,
  };
}

export async function listEmployees({
  page = 1,
  limit = 10,
  search,
  department,
  active,
}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;
  const where = buildWhere({ search, department, active });

  const [employees, total, departments] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { name: 'asc' },
      include: {
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
          take: 1,
          select: {
            id: true,
            evaluatedAt: true,
            status: true,
            classification: true,
            finalScore: true,
          },
        },
      },
    }),
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      distinct: ['department'],
      select: { department: true },
      orderBy: { department: 'asc' },
    }),
  ]);

  return {
    data: employees.map(mapEmployee),
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
      departments: departments.map((item) => item.department),
    },
  };
}

export async function getEmployeeById(id) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      evaluations: {
        orderBy: { evaluatedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          evaluatedAt: true,
          status: true,
          classification: true,
          finalScore: true,
        },
      },
    },
  });

  if (!employee) {
    throw new AppError('Colaborador não encontrado.', 404);
  }

  return mapEmployee(employee);
}

export async function getEmployeeHistory(id) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!employee) {
    throw new AppError('Colaborador não encontrado.', 404);
  }

  const evaluations = await prisma.evaluation.findMany({
    where: { employeeId: id },
    orderBy: { evaluatedAt: 'desc' },
    select: {
      id: true,
      period: true,
      evaluatedAt: true,
      status: true,
      finalScore: true,
      classification: true,
      template: {
        select: { name: true },
      },
    },
  });

  return {
    employee,
    evaluations,
  };
}

export async function createEmployee(data) {
  const employee = await prisma.employee.create({
    data: {
      name: data.name.trim(),
      position: data.position.trim(),
      department: data.department.trim(),
      active: data.active ?? true,
    },
    include: {
      evaluations: {
        take: 0,
      },
    },
  });

  return mapEmployee({ ...employee, evaluations: [] });
}

export async function updateEmployee(id, data) {
  await getEmployeeById(id);

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      name: data.name.trim(),
      position: data.position.trim(),
      department: data.department.trim(),
      active: data.active,
    },
    include: {
      evaluations: {
        orderBy: { evaluatedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          evaluatedAt: true,
          status: true,
          classification: true,
          finalScore: true,
        },
      },
    },
  });

  return mapEmployee(employee);
}

export async function deleteEmployee(id) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      _count: {
        select: { evaluations: true },
      },
    },
  });

  if (!employee) {
    throw new AppError('Colaborador não encontrado.', 404);
  }

  if (employee._count.evaluations > 0) {
    throw new AppError(
      'Não é possível excluir colaborador com avaliações registradas.',
      409,
    );
  }

  await prisma.employee.delete({ where: { id } });

  return { message: 'Colaborador excluído com sucesso.' };
}
