import * as employeeService from '../services/employee.service.js';
import { AppError } from '../middlewares/errorHandler.js';

function validateEmployeePayload(body, { partial = false } = {}) {
  const errors = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) {
      errors.push('Nome é obrigatório.');
    }
  }

  if (!partial || body.position !== undefined) {
    if (!body.position?.trim()) {
      errors.push('Cargo é obrigatório.');
    }
  }

  if (!partial || body.department !== undefined) {
    if (!body.department?.trim()) {
      errors.push('Área é obrigatória.');
    }
  }

  if (body.active !== undefined && typeof body.active !== 'boolean') {
    errors.push('Status deve ser verdadeiro ou falso.');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(' '), 400);
  }
}

export async function list(req, res, next) {
  try {
    const result = await employeeService.listEmployees(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.json(employee);
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const history = await employeeService.getEmployeeHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    validateEmployeePayload(req.body);
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    validateEmployeePayload(req.body, { partial: true });
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.json(employee);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await employeeService.deleteEmployee(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
