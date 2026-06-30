import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import employeeRoutes from './employee.routes.js';
import evaluationRoutes from './evaluation.routes.js';
import healthRoutes from './health.routes.js';
import templateRoutes from './template.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/templates', templateRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/health', healthRoutes);

export default router;
