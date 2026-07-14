import * as teamService from '../services/team.service.js';
import { AppError } from '../middlewares/errorHandler.js';

function validateTeamPayload(body, { partial = false } = {}) {
  const errors = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) {
      errors.push('Nome do time é obrigatório.');
    }
  }

  if (body.managerIds !== undefined && !Array.isArray(body.managerIds)) {
    errors.push('managerIds deve ser uma lista.');
  }

  if (body.employeeIds !== undefined && !Array.isArray(body.employeeIds)) {
    errors.push('employeeIds deve ser uma lista.');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }
}

export async function list(req, res, next) {
  try {
    const result = await teamService.listTeams(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    validateTeamPayload(req.body);
    const team = await teamService.createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    validateTeamPayload(req.body, { partial: true });
    const team = await teamService.updateTeam(req.params.id, req.body);
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await teamService.deleteTeam(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function addMember(req, res, next) {
  try {
    if (!req.body.employeeId) {
      throw new AppError('employeeId é obrigatório.', 400);
    }

    const team = await teamService.addTeamMember(req.params.id, req.body.employeeId);
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    const team = await teamService.removeTeamMember(
      req.params.id,
      req.params.employeeId,
    );
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function addManager(req, res, next) {
  try {
    if (!req.body.managerId) {
      throw new AppError('managerId é obrigatório.', 400);
    }

    const team = await teamService.addTeamManager(req.params.id, req.body.managerId);
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function removeManager(req, res, next) {
  try {
    const team = await teamService.removeTeamManager(
      req.params.id,
      req.params.managerId,
    );
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function setManagers(req, res, next) {
  try {
    if (!Array.isArray(req.body.managerIds)) {
      throw new AppError('managerIds deve ser uma lista.', 400);
    }

    const team = await teamService.setTeamManagers(req.params.id, req.body.managerIds);
    res.json(team);
  } catch (error) {
    next(error);
  }
}

export async function searchEmployees(req, res, next) {
  try {
    const result = await teamService.searchEmployeesForTeams(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function searchManagers(req, res, next) {
  try {
    const result = await teamService.searchManagersForTeams(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
