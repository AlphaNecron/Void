export enum Permission {
  SHORTEN = 2,
  USE_BOT = 4,
  INVITE_USERS = 8,
  VANITY = 16,
  BYPASS_LIMIT = 32,
  ADMINISTRATION = 64,
  OWNER = 128
}

export function isAdmin(permInt: number): boolean {
  return [Permission.ADMINISTRATION, Permission.OWNER].some(p => hasPermission(permInt, p, false));
}

export function hasPermission(permInt: number, perm: Permission, withAdmin = true): boolean {
  const has = p => (permInt & p) !== 0;
  return withAdmin ? [Permission.ADMINISTRATION, Permission.OWNER, perm].some(p => has(p)) : has(perm);
}
