import { Router } from 'express';
import { PERMISSIONS } from '../auth/permissions.js';
import * as templateController from '../controllers/template.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.TEMPLATES_VIEW), templateController.list);
router.get('/:id', authorize(PERMISSIONS.TEMPLATES_VIEW), templateController.getById);

export default router;
