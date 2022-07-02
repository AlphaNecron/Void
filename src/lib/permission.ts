export enum Permission {
  SHORTEN = 2,
  BYPASS_LIMIT = 4,
  VANITY = 8,
  ADMINISTRATION = 16,
  OWNER = 32
}

export function isAdmin(permInt: number) {
  return [Permission.ADMINISTRATION, Permission.OWNER].some(p => hasPermission(permInt, p, false));
}

export function hasPermission(permInt: number, perm: Permission, withAdmin = true): boolean {
  const has = p => (permInt & p) !== 0;
  return withAdmin ? [Permission.ADMINISTRATION, Permission.OWNER, perm].some(p => has(p)) : has(perm);
}
