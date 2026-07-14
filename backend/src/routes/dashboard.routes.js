import { Router } from 'express';
import { PERMISSIONS } from '../auth/permissions.js';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats', authorize(PERMISSIONS.DASHBOARD_VIEW), dashboardController.getStats);

export default router;
