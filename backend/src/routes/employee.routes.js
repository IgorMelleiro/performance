import { Router } from 'express';
import { PERMISSIONS } from '../auth/permissions.js';
import * as employeeController from '../controllers/employee.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(
    PERMISSIONS.EMPLOYEES_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_VIEW_TEAM,
    PERMISSIONS.EMPLOYEES_VIEW_SELF,
  ),
  employeeController.list,
);

router.get(
  '/:id/history',
  authorize(
    PERMISSIONS.EMPLOYEES_VIEW_HISTORY,
    PERMISSIONS.EMPLOYEES_VIEW_SELF,
  ),
  employeeController.getHistory,
);

router.get(
  '/:id',
  authorize(
    PERMISSIONS.EMPLOYEES_VIEW_ALL,
    PERMISSIONS.EMPLOYEES_VIEW_TEAM,
    PERMISSIONS.EMPLOYEES_VIEW_SELF,
  ),
  employeeController.getById,
);

router.post('/', authorize(PERMISSIONS.EMPLOYEES_CREATE), employeeController.create);
router.put('/:id', authorize(PERMISSIONS.EMPLOYEES_UPDATE), employeeController.update);
router.delete('/:id', authorize(PERMISSIONS.EMPLOYEES_DELETE), employeeController.remove);

export default router;
