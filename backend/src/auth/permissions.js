import { ROLES } from './roles.js';

export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard:view',

  EMPLOYEES_VIEW_ALL: 'employees:view_all',
  EMPLOYEES_VIEW_TEAM: 'employees:view_team',
  EMPLOYEES_VIEW_SELF: 'employees:view_self',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_UPDATE: 'employees:update',
  EMPLOYEES_DELETE: 'employees:delete',
  EMPLOYEES_VIEW_HISTORY: 'employees:view_history',

  EVALUATIONS_VIEW_ALL: 'evaluations:view_all',
  EVALUATIONS_VIEW_TEAM: 'evaluations:view_team',
  EVALUATIONS_VIEW_SELF: 'evaluations:view_self',
  EVALUATIONS_CREATE: 'evaluations:create',
  EVALUATIONS_CREATE_TEAM: 'evaluations:create_team',
  EVALUATIONS_CREATE_SELF: 'evaluations:create_self',
  EVALUATIONS_UPDATE: 'evaluations:update',
  EVALUATIONS_UPDATE_TEAM: 'evaluations:update_team',
  EVALUATIONS_UPDATE_SELF: 'evaluations:update_self',
  EVALUATIONS_DELETE: 'evaluations:delete',

  TEAMS_VIEW: 'teams:view',
  TEAMS_CREATE: 'teams:create',
  TEAMS_UPDATE: 'teams:update',
  TEAMS_DELETE: 'teams:delete',
  TEAMS_MANAGE_MEMBERS: 'teams:manage_members',
  TEAMS_MANAGE_MANAGERS: 'teams:manage_managers',

  TEMPLATES_VIEW: 'templates:view',
  TEMPLATES_MANAGE: 'templates:manage',

  PROFILE_VIEW_SELF: 'profile:view_self',
});

const RH_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.EMPLOYEES_VIEW_ALL,
  PERMISSIONS.EMPLOYEES_CREATE,
  PERMISSIONS.EMPLOYEES_UPDATE,
  PERMISSIONS.EMPLOYEES_DELETE,
  PERMISSIONS.EMPLOYEES_VIEW_HISTORY,
  PERMISSIONS.EVALUATIONS_VIEW_ALL,
  PERMISSIONS.EVALUATIONS_CREATE,
  PERMISSIONS.EVALUATIONS_UPDATE,
  PERMISSIONS.EVALUATIONS_DELETE,
  PERMISSIONS.TEAMS_VIEW,
  PERMISSIONS.TEAMS_CREATE,
  PERMISSIONS.TEAMS_UPDATE,
  PERMISSIONS.TEAMS_DELETE,
  PERMISSIONS.TEAMS_MANAGE_MEMBERS,
  PERMISSIONS.TEAMS_MANAGE_MANAGERS,
  PERMISSIONS.TEMPLATES_VIEW,
  PERMISSIONS.TEMPLATES_MANAGE,
  PERMISSIONS.PROFILE_VIEW_SELF,
];

const GERENTE_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.EMPLOYEES_VIEW_TEAM,
  PERMISSIONS.EMPLOYEES_VIEW_HISTORY,
  PERMISSIONS.EVALUATIONS_VIEW_TEAM,
  PERMISSIONS.EVALUATIONS_CREATE_TEAM,
  PERMISSIONS.EVALUATIONS_UPDATE_TEAM,
  PERMISSIONS.TEMPLATES_VIEW,
  PERMISSIONS.PROFILE_VIEW_SELF,
];

const FUNCIONARIO_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.EMPLOYEES_VIEW_SELF,
  PERMISSIONS.EVALUATIONS_VIEW_SELF,
  PERMISSIONS.EVALUATIONS_CREATE_SELF,
  PERMISSIONS.EVALUATIONS_UPDATE_SELF,
  PERMISSIONS.TEMPLATES_VIEW,
  PERMISSIONS.PROFILE_VIEW_SELF,
];

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.RH]: Object.freeze(RH_PERMISSIONS),
  [ROLES.GERENTE]: Object.freeze(GERENTE_PERMISSIONS),
  [ROLES.FUNCIONARIO]: Object.freeze(FUNCIONARIO_PERMISSIONS),
});

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role, permission) {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role, permissions = []) {
  if (!permissions.length) {
    return true;
  }

  const rolePermissions = getPermissionsForRole(role);
  return permissions.some((permission) => rolePermissions.includes(permission));
}

export function hasAllPermissions(role, permissions = []) {
  if (!permissions.length) {
    return true;
  }

  const rolePermissions = getPermissionsForRole(role);
  return permissions.every((permission) => rolePermissions.includes(permission));
}
