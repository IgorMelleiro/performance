import { randomUUID } from 'crypto';
import prisma from '../config/prisma.js';
import { ROLES } from '../auth/roles.js';
import { AppError } from '../middlewares/errorHandler.js';

function mapTeam(team) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    membersCount: team._count?.members ?? team.members?.length ?? 0,
    managersCount: team._count?.managers ?? team.managers?.length ?? 0,
    managers: (team.managers ?? []).map((item) => ({
      id: item.id,
      managerId: item.managerId,
      name: item.manager.name,
      email: item.manager.email,
    })),
    members: (team.members ?? []).map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      userId: item.userId,
      name: item.employee.name,
      position: item.employee.position,
      department: item.employee.department,
      active: item.employee.active,
    })),
  };
}

const teamDetailInclude = {
  managers: {
    include: {
      manager: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
  members: {
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
          department: true,
          active: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  },
  _count: {
    select: { members: true, managers: true },
  },
};

export async function listTeams({ page = 1, limit = 10, search } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const where = {};

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { name: 'asc' },
      include: {
        managers: {
          include: {
            manager: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { members: true, managers: true },
        },
      },
    }),
    prisma.team.count({ where }),
  ]);

  return {
    data: teams.map(mapTeam),
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getTeamById(id) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: teamDetailInclude,
  });

  if (!team) {
    throw new AppError('Time não encontrado.', 404);
  }

  return mapTeam(team);
}

async function assertManagerCandidates(managerIds = []) {
  if (!managerIds.length) {
    return;
  }

  const managers = await prisma.user.findMany({
    where: {
      id: { in: managerIds },
      role: ROLES.GERENTE,
    },
    select: { id: true },
  });

  if (managers.length !== managerIds.length) {
    throw new AppError(
      'Um ou mais gerentes informados são inválidos. Somente usuários com papel Gerente podem gerenciar times.',
      400,
    );
  }
}

async function assertEmployeeCandidates(employeeIds = []) {
  if (!employeeIds.length) {
    return;
  }

  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, userId: true },
  });

  if (employees.length !== employeeIds.length) {
    throw new AppError('Um ou mais colaboradores informados não existem.', 400);
  }

  return employees;
}

export async function createTeam(data) {
  const name = data.name?.trim();
  if (!name) {
    throw new AppError('Nome do time é obrigatório.', 400);
  }

  const managerIds = [...new Set(data.managerIds ?? [])];
  const employeeIds = [...new Set(data.employeeIds ?? [])];

  await assertManagerCandidates(managerIds);
  const employees = await assertEmployeeCandidates(employeeIds);

  const team = await prisma.team.create({
    data: {
      id: randomUUID(),
      name,
      description: data.description?.trim() || null,
      managers: {
        create: managerIds.map((managerId) => ({
          id: randomUUID(),
          managerId,
        })),
      },
      members: {
        create: (employees ?? []).map((employee) => ({
          id: randomUUID(),
          employeeId: employee.id,
          userId: employee.userId,
        })),
      },
    },
    include: teamDetailInclude,
  });

  return mapTeam(team);
}

export async function updateTeam(id, data) {
  await getTeamById(id);

  if (data.name !== undefined && !data.name?.trim()) {
    throw new AppError('Nome do time é obrigatório.', 400);
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description?.trim() || null }
        : {}),
    },
    include: teamDetailInclude,
  });

  return mapTeam(team);
}

export async function deleteTeam(id) {
  await getTeamById(id);
  await prisma.team.delete({ where: { id } });
  return { message: 'Time excluído com sucesso.' };
}

export async function addTeamMember(teamId, employeeId) {
  await getTeamById(teamId);

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, userId: true },
  });

  if (!employee) {
    throw new AppError('Colaborador não encontrado.', 404);
  }

  const existing = await prisma.teamMember.findUnique({
    where: {
      teamId_employeeId: { teamId, employeeId },
    },
  });

  if (existing) {
    throw new AppError('Colaborador já pertence a este time.', 409);
  }

  await prisma.teamMember.create({
    data: {
      id: randomUUID(),
      teamId,
      employeeId,
      userId: employee.userId,
    },
  });

  return getTeamById(teamId);
}

export async function removeTeamMember(teamId, employeeId) {
  await getTeamById(teamId);

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_employeeId: { teamId, employeeId },
    },
  });

  if (!membership) {
    throw new AppError('Colaborador não pertence a este time.', 404);
  }

  await prisma.teamMember.delete({ where: { id: membership.id } });
  return getTeamById(teamId);
}

export async function addTeamManager(teamId, managerId) {
  await getTeamById(teamId);
  await assertManagerCandidates([managerId]);

  const existing = await prisma.teamManager.findUnique({
    where: {
      teamId_managerId: { teamId, managerId },
    },
  });

  if (existing) {
    throw new AppError('Gerente já está vinculado a este time.', 409);
  }

  await prisma.teamManager.create({
    data: {
      id: randomUUID(),
      teamId,
      managerId,
    },
  });

  return getTeamById(teamId);
}

export async function removeTeamManager(teamId, managerId) {
  await getTeamById(teamId);

  const link = await prisma.teamManager.findUnique({
    where: {
      teamId_managerId: { teamId, managerId },
    },
  });

  if (!link) {
    throw new AppError('Gerente não está vinculado a este time.', 404);
  }

  await prisma.teamManager.delete({ where: { id: link.id } });
  return getTeamById(teamId);
}

export async function setTeamManagers(teamId, managerIds = []) {
  await getTeamById(teamId);

  const uniqueIds = [...new Set(managerIds)];
  await assertManagerCandidates(uniqueIds);

  await prisma.$transaction(async (tx) => {
    await tx.teamManager.deleteMany({ where: { teamId } });

    if (uniqueIds.length > 0) {
      await tx.teamManager.createMany({
        data: uniqueIds.map((managerId) => ({
          id: randomUUID(),
          teamId,
          managerId,
        })),
      });
    }
  });

  return getTeamById(teamId);
}

export async function searchEmployeesForTeams({ search = '', excludeTeamId } = {}) {
  const where = {
    active: true,
  };

  if (search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { position: { contains: term, mode: 'insensitive' } },
      { department: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (excludeTeamId) {
    where.teamMemberships = {
      none: { teamId: excludeTeamId },
    };
  }

  const employees = await prisma.employee.findMany({
    where,
    take: 20,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      position: true,
      department: true,
      active: true,
    },
  });

  return { data: employees };
}

export async function searchManagersForTeams({ search = '', excludeTeamId } = {}) {
  const where = {
    role: ROLES.GERENTE,
  };

  if (search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (excludeTeamId) {
    where.managedTeams = {
      none: { teamId: excludeTeamId },
    };
  }

  const managers = await prisma.user.findMany({
    where,
    take: 20,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return { data: managers };
}
