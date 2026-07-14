import { Router } from 'express';
import { PERMISSIONS } from '../auth/permissions.js';
import * as evaluationController from '../controllers/evaluation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(
    PERMISSIONS.EVALUATIONS_VIEW_ALL,
    PERMISSIONS.EVALUATIONS_VIEW_TEAM,
    PERMISSIONS.EVALUATIONS_VIEW_SELF,
  ),
  evaluationController.list,
);

router.post(
  '/self',
  authorize(PERMISSIONS.EVALUATIONS_CREATE_SELF),
  evaluationController.createSelf,
);

router.post(
  '/',
  authorize(
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_CREATE_TEAM,
    PERMISSIONS.EVALUATIONS_CREATE_SELF,
  ),
  evaluationController.create,
);

router.get(
  '/:id/summary',
  authorize(
    PERMISSIONS.EVALUATIONS_VIEW_ALL,
    PERMISSIONS.EVALUATIONS_VIEW_TEAM,
    PERMISSIONS.EVALUATIONS_VIEW_SELF,
  ),
  evaluationController.getSummary,
);

router.get(
  '/:id',
  authorize(
    PERMISSIONS.EVALUATIONS_VIEW_ALL,
    PERMISSIONS.EVALUATIONS_VIEW_TEAM,
    PERMISSIONS.EVALUATIONS_VIEW_SELF,
  ),
  evaluationController.getById,
);

router.put(
  '/:id',
  authorize(
    PERMISSIONS.EVALUATIONS_UPDATE,
    PERMISSIONS.EVALUATIONS_UPDATE_TEAM,
    PERMISSIONS.EVALUATIONS_UPDATE_SELF,
  ),
  evaluationController.update,
);

router.post(
  '/:id/complete',
  authorize(
    PERMISSIONS.EVALUATIONS_UPDATE,
    PERMISSIONS.EVALUATIONS_UPDATE_TEAM,
    PERMISSIONS.EVALUATIONS_UPDATE_SELF,
  ),
  evaluationController.complete,
);

router.delete('/:id', authorize(PERMISSIONS.EVALUATIONS_DELETE), evaluationController.remove);

export default router;
