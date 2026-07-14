export const ROLES = Object.freeze({
  RH: 'RH',
  GERENTE: 'GERENTE',
  FUNCIONARIO: 'FUNCIONARIO',
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.RH]: 'RH',
  [ROLES.GERENTE]: 'Gerente',
  [ROLES.FUNCIONARIO]: 'Funcionário',
});

export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}
