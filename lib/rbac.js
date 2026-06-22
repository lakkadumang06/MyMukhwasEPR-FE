/** Role constants (mirror backend). */
export const Role = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  PRODUCTION: 'production',
  SALES: 'sales',
  ACCOUNTANT: 'accountant',
};

/** Whether `role` is one of the allowed roles. Admin always allowed. */
export function can(role, allowed) {
  if (!role) return false;
  if (role === Role.ADMIN) return true;
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(role);
}
