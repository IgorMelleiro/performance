import prisma from '../config/prisma.js';
import { hasPermission, PERMISSIONS } from './permissions.js';
import { ROLES } from './roles.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function getManagedTeamIds(userId) {
  const links = await prisma.teamManager.findMany({
    where: { managerId: userId },
    select: { teamId: true },
  });

  return links.map((item) => item.teamId);
}

export async function getTeamEmployeeIds(userId) {
  const teamIds = await getManagedTeamIds(userId);

  if (teamIds.length === 0) {
    return [];
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId: { in: teamIds } },
    select: { employeeId: true },
  });

  return [...new Set(members.map((item) => item.employeeId))];
}

export async function getSelfEmployeeId(userId) {
  const employee = await prisma.employee.findUnique({
    where: { userId },
    select: { id: true },
  });

  return employee?.id ?? null;
}

export async function buildEmployeeAccessWhere(user) {
  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_ALL)) {
    return {};
  }

  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_TEAM)) {
    const employeeIds = await getTeamEmployeeIds(user.id);
    return { id: { in: employeeIds } };
  }

  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_SELF)) {
    const employeeId = await getSelfEmployeeId(user.id);
    return { id: { in: employeeId ? [employeeId] : [] } };
  }

  throw new AppError('Acesso negado.', 403);
}

export async function assertCanAccessEmployee(user, employeeId) {
  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_ALL)) {
    return;
  }

  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_TEAM)) {
    const employeeIds = await getTeamEmployeeIds(user.id);
    if (!employeeIds.includes(employeeId)) {
      throw new AppError('Acesso negado a este colaborador.', 403);
    }
    return;
  }

  if (hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_SELF)) {
    const selfId = await getSelfEmployeeId(user.id);
    if (!selfId || selfId !== employeeId) {
      throw new AppError('Acesso negado a este colaborador.', 403);
    }
    return;
  }

  throw new AppError('Acesso negado.', 403);
}

export async function buildEvaluationAccessWhere(user) {
  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_VIEW_ALL)) {
    return {};
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_VIEW_TEAM)) {
    const employeeIds = await getTeamEmployeeIds(user.id);
    return { employeeId: { in: employeeIds } };
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_VIEW_SELF)) {
    const employeeId = await getSelfEmployeeId(user.id);
    return { employeeId: { in: employeeId ? [employeeId] : [] } };
  }

  throw new AppError('Acesso negado.', 403);
}

export async function assertCanAccessEvaluation(user, evaluation) {
  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_VIEW_ALL)) {
    return;
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_VIEW_TEAM)) {
    const employeeIds = await getTeamEmployeeIds(user.id);
    if (!employeeIds.includes(evaluation.employeeId)) {
      throw new AppError('Acesso negado a esta avaliação.', 403);
    }
    return;
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_VIEW_SELF)) {
    const selfId = await getSelfEmployeeId(user.id);
    if (!selfId || selfId !== evaluation.employeeId) {
      throw new AppError('Acesso negado a esta avaliação.', 403);
    }
    return;
  }

  throw new AppError('Acesso negado.', 403);
}

/**
 * Criação de avaliação conforme permissões do papel.
 * Retorna opções (ex.: isAutoEvaluation) aplicadas no create.
 */
export async function assertCanCreateEvaluation(user, employeeId) {
  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_CREATE)) {
    return { isAutoEvaluation: false };
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_CREATE_TEAM)) {
    const employeeIds = await getTeamEmployeeIds(user.id);
    if (!employeeIds.includes(employeeId)) {
      throw new AppError(
        'Você só pode criar avaliações de colaboradores dos seus times.',
        403,
      );
    }
    return { isAutoEvaluation: false };
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_CREATE_SELF)) {
    const selfId = await getSelfEmployeeId(user.id);
    if (!selfId || selfId !== employeeId) {
      throw new AppError('Você só pode criar a própria autoavaliação.', 403);
    }
    return { isAutoEvaluation: true };
  }

  throw new AppError('Acesso negado.', 403);
}

export async function assertCanMutateEvaluation(user, evaluation) {
  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_UPDATE)) {
    return;
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_UPDATE_TEAM)) {
    const employeeIds = await getTeamEmployeeIds(user.id);
    if (!employeeIds.includes(evaluation.employeeId)) {
      throw new AppError(
        'Você só pode editar avaliações de colaboradores dos seus times.',
        403,
      );
    }
    return;
  }

  if (hasPermission(user.role, PERMISSIONS.EVALUATIONS_UPDATE_SELF)) {
    const selfId = await getSelfEmployeeId(user.id);
    if (!selfId || selfId !== evaluation.employeeId) {
      throw new AppError('Você só pode editar as próprias avaliações.', 403);
    }

    if (!evaluation.isAutoEvaluation && user.role === ROLES.FUNCIONARIO) {
      throw new AppError(
        'Funcionários só podem editar autoavaliações.',
        403,
      );
    }

    return;
  }

  throw new AppError('Acesso negado.', 403);
}

export async function assertCanDeleteEvaluation(user, evaluation) {
  if (!hasPermission(user.role, PERMISSIONS.EVALUATIONS_DELETE)) {
    throw new AppError('Acesso negado.', 403);
  }

  await assertCanAccessEvaluation(user, evaluation);
}
