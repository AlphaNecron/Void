import { charsets } from './constants';

export default function generate(charset: 'alphanumeric' | 'emoji' | 'invisible', length: number): string {
  let rand = '', i: number;
  for (i = 0; i < length; i++) rand += charsets[charset][Math.floor(Math.random() * charsets[charset].length)];
  return rand;
}