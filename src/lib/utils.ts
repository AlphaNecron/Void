import {MANTINE_COLORS} from '@mantine/core';
import {units} from 'lib/constants';
import generate from './urlGenerator';

export function generateToken(): string {
  return `${generate('alphanumeric', 16)}.${Buffer.from(Date.now().toString()).toString('base64').replace(/=+$/, '')}`;
}

export function addToDate(date: Date, seconds: number): Date {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}

export function log(base: number, num: number) {
  return Math.log(num) / Math.log(base);
}

export function validateHex(color: string): boolean { // https://gist.github.com/rijkvanzanten/560dd06c4e2143aebd552abaeeee3e9b
  if (color.substring(0, 1) !== '#') return false;
  color = color.substring(1);
  switch (color.length) {
  case 3:
    return /^[\dA-F]{3}$/i.test(color);
  case 6:
    return /^[\dA-F]{6}$/i.test(color);
  case 8:
    return /^[\dA-F]{8}$/i.test(color);
  default:
    return false;
  }
}

export function validateColor(color: string, extraColors: string[] = [], fallback = 'void'): string {
  return [...MANTINE_COLORS, ...extraColors].includes(color) ? color : fallback;
}

export function prettyBytes(bytes: number): string {
  const isNegative = bytes < 0;
  if (!Number.isFinite(bytes) || Number.isNaN(bytes)) return '0 B';
  if (isNegative)
    bytes *= -1;
  const i = Math.min(Math.floor(log(1024, bytes)), units.length);
  bytes /= 1024 ** i;
  return `${isNegative ? '-' : ''}${parseFloat(bytes.toFixed(1))} ${units[i]}`;
}
