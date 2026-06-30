import * as dashboardService from '../services/dashboard.service.js';

export async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
