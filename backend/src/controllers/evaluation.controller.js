import * as evaluationService from '../services/evaluation.service.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function list(req, res, next) {
  try {
    const result = await evaluationService.listEvaluations(req.query, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const evaluation = await evaluationService.getEvaluationById(
      req.params.id,
      req.user,
    );
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
}

export async function getSummary(req, res, next) {
  try {
    const summary = await evaluationService.getEvaluationSummary(
      req.params.id,
      req.user,
    );
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const { employeeId, templateId, period, evaluatedAt } = req.body;

    if (!employeeId || !templateId || !period?.trim()) {
      throw new AppError(
        'Colaborador, template e período são obrigatórios.',
        400,
      );
    }

    const evaluation = await evaluationService.createEvaluation(
      { employeeId, templateId, period, evaluatedAt },
      req.user,
    );

    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
}

export async function createSelf(req, res, next) {
  try {
    const { templateId, period, evaluatedAt } = req.body;

    if (!period?.trim()) {
      throw new AppError('Período avaliado é obrigatório.', 400);
    }

    const evaluation = await evaluationService.createSelfEvaluation(
      { templateId, period, evaluatedAt },
      req.user,
    );

    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const evaluation = await evaluationService.updateEvaluation(
      req.params.id,
      req.body,
      req.user,
    );
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
}

export async function complete(req, res, next) {
  try {
    const evaluation = await evaluationService.completeEvaluation(
      req.params.id,
      req.user,
    );
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await evaluationService.deleteEvaluation(
      req.params.id,
      req.user,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}
