import {MANTINE_COLORS} from '@mantine/core';
import generate from './urlGenerator';


export function generateToken(): string {
  return generate('alphanumeric', 16) + '.' + Buffer.from(Date.now().toString()).toString('base64').replace(/=+$/, '');
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
export function parseByte(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let num = 0;
  let isNegative = false;
  if (bytes < 0) {
    bytes *= -1;
    isNegative = true;
  }
  while (bytes >= 1024 && num < units.length - 1) {
    bytes /= 1024;
    num++;
  }
  return `${+(isNaN(bytes) ? 0 : isNegative ? -bytes : bytes).toFixed(1)} ${units[Math.min(num, units.length - 1)]}`;
}
