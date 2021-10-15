import { charsets } from './constants';
const { plain: pcharset, zerowidth: zcharset, emoji: echarset } = charsets;
export default function plain(length: number): string {
  for (var i = 0, rand = ''; i < length; ++i) rand += pcharset[Math.floor(Math.random() * pcharset.length)];
  return rand;
}

export function zws(length: number): string {
  for (var i = 0, rand = ''; i < length; ++i) rand += zcharset[Math.floor(Math.random() * zcharset.length)];
  return rand;
}

export function emoji(length: number): string {
  for (var i = 0, rand = ''; i < length; ++i) rand += echarset[Math.floor(Math.random() * echarset.length)];
  return rand;
}