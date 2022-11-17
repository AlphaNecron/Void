export enum Permission {
  SHORTEN = 2,
  USE_BOT = 4,
  INVITE_USERS = 8,
  VANITY = 16,
  BYPASS_LIMIT = 32,
  ADMINISTRATION = 8192, // Adding space for further permissions
  OWNER = 16384
}

export function isAdmin(permInt: number): boolean {
  return [Permission.ADMINISTRATION, Permission.OWNER].some(p => hasPermission(permInt, p, false));
}

export const maxed = Object.values(Permission).filter(p => typeof p === 'number').reduce((a: number, b: number) => a | b, 0) as Permission;

export function getPermissions(permInt: number): Permission[] {
  return Object.values(Permission).filter(p => typeof p === 'number' && (permInt & p) !== 0) as Permission[];
}

export function highest(permInt: number): Permission {
  const highest = 1 << Math.floor(Math.log2(Math.min(permInt, Permission.OWNER)));
  return highest === 1 ? 0 : highest;
}

export function hasPermission(permInt: number, perm: Permission, withAdmin = true): boolean {
  const has = p => (permInt & p) !== 0;
  return withAdmin ? [Permission.ADMINISTRATION, Permission.OWNER, perm].some(p => has(p)) : has(perm);
}
