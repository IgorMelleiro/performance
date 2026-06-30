import * as templateService from '../services/template.service.js';

export async function list(_req, res, next) {
  try {
    const templates = await templateService.listActiveTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    res.json(template);
  } catch (error) {
    next(error);
  }
}
