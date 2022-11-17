import {MANTINE_COLORS} from '@mantine/core';
import {timeUnits, units} from 'lib/constants';
import {colorRegex} from 'lib/validate';
import generate from 'lib/urlGenerator';

export function generateToken(): string {
  return `${generate('alphanumeric', 16)}.${Buffer.from(Date.now().toString()).toString('base64').replace(/=+$/, '')}`;
}

export function addToDate(date: Date, seconds: number): Date {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}

export function prettySec(sec: number, options: {
  pad?: boolean;
  verbose?: boolean;
  withColon?: boolean;
}): string {
  const hours = Math.floor(sec / 3600),
    rem = (sec - (hours * 3600)),
    minutes = Math.floor(rem / 60),
    seconds = Math.floor(rem - (minutes * 60));
  return [hours, minutes, seconds]
    .map(v => options.pad ? v.toString().padStart(2, '0') : v.toString())
    .map((v, i) => options.withColon ? v : `${v} ${timeUnits[i][options.verbose ? 1 : 0]}${v === (options.pad ? '01' : '1') && options.verbose ? '' : 's'}`)
    .join(options.withColon ? ':' : ' ');
}

export function isEmpty(obj): boolean {
  return Object.keys(obj).length === 0;
}

export function validateHex(color: string): boolean {
  return colorRegex.test(color);
}

export function validateColor(color: string, extraColors: string[] = [], fallback = 'void'): string {
  return [...MANTINE_COLORS, ...extraColors].includes(color) ? color : fallback;
}

export function prettyBytes(bytes: number): string {
  let i = 0;
  if (isNaN(bytes) || !isFinite(bytes) || !bytes) return '0 B';
  const isNegative = bytes < 0;
  if (isNegative)
    bytes *= -1;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${+((isNegative ? -bytes : bytes).toFixed(1))} ${units[i]}`;
}
