import { Router } from 'express';
import * as evaluationController from '../controllers/evaluation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', evaluationController.list);
router.post('/', evaluationController.create);
router.get('/:id/summary', evaluationController.getSummary);
router.get('/:id', evaluationController.getById);
router.put('/:id', evaluationController.update);
router.post('/:id/complete', evaluationController.complete);
router.delete('/:id', evaluationController.remove);

export default router;
