import {MANTINE_COLORS} from '@mantine/core';
import {noop, units} from 'lib/constants';
import {FetchParameters} from 'lib/types';
import generate from './urlGenerator';

export function generateToken(): string {
  return `${generate('alphanumeric', 16)}.${Buffer.from(Date.now().toString()).toString('base64').replace(/=+$/, '')}`;
}

export function addToDate(date: Date, seconds: number): Date {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
}

export function request({ onStart, endpoint, method, callback = noop, headers, onDone = noop, body, onError = noop }: FetchParameters): Promise<void> {
  if (onStart)
    onStart();
  return fetch(endpoint, {
    method: method || 'GET',
    headers: {'Content-Type': 'application/json',...headers},
    body: JSON.stringify(body)
  }).then(r => r.json()).then(r => {
    if (r.error)
      throw new Error(r.error);
    return r;
  }).then(callback).catch(e => onError(e.message || e.name)).finally(onDone);
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
