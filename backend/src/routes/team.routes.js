import { Router } from 'express';
import { PERMISSIONS } from '../auth/permissions.js';
import * as teamController from '../controllers/team.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = Router();

router.use(authenticate);

router.get(
  '/search/employees',
  authorize(PERMISSIONS.TEAMS_MANAGE_MEMBERS),
  teamController.searchEmployees,
);

router.get(
  '/search/managers',
  authorize(PERMISSIONS.TEAMS_MANAGE_MANAGERS),
  teamController.searchManagers,
);

router.get('/', authorize(PERMISSIONS.TEAMS_VIEW), teamController.list);
router.post('/', authorize(PERMISSIONS.TEAMS_CREATE), teamController.create);
router.get('/:id', authorize(PERMISSIONS.TEAMS_VIEW), teamController.getById);
router.put('/:id', authorize(PERMISSIONS.TEAMS_UPDATE), teamController.update);
router.delete('/:id', authorize(PERMISSIONS.TEAMS_DELETE), teamController.remove);

router.post(
  '/:id/members',
  authorize(PERMISSIONS.TEAMS_MANAGE_MEMBERS),
  teamController.addMember,
);

router.delete(
  '/:id/members/:employeeId',
  authorize(PERMISSIONS.TEAMS_MANAGE_MEMBERS),
  teamController.removeMember,
);

router.post(
  '/:id/managers',
  authorize(PERMISSIONS.TEAMS_MANAGE_MANAGERS),
  teamController.addManager,
);

router.put(
  '/:id/managers',
  authorize(PERMISSIONS.TEAMS_MANAGE_MANAGERS),
  teamController.setManagers,
);

router.delete(
  '/:id/managers/:managerId',
  authorize(PERMISSIONS.TEAMS_MANAGE_MANAGERS),
  teamController.removeManager,
);

export default router;
