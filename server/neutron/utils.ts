import voidPkg from 'packageInfo';

export function getRelativeDate(ms: number): Date {
  return new Date(Date.now() + ms);
}

export function getVersion(): string {
  return voidPkg.neutronVersion;
}
