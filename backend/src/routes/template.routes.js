import { Router } from 'express';
import * as templateController from '../controllers/template.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', templateController.list);
router.get('/:id', templateController.getById);

export default router;
