import {createHmac, timingSafeEqual} from 'crypto';
import generate from './urlGenerator';


export function generateToken() {
  return generate('alphanumeric', 16) + '.' + Buffer.from(Date.now().toString()).toString('base64').replace(/=+$/, '');
}

export function validateHex(color: string): boolean { // https://gist.github.com/rijkvanzanten/560dd06c4e2143aebd552abaeeee3e9b
  if(color.substring(0, 1) === '#') color = color.substring(1);
  switch(color.length) {
  case 3: return /^[\dA-F]{3}$/i.test(color);
  case 6: return /^[\dA-F]{6}$/i.test(color);
  case 8: return /^[\dA-F]{8}$/i.test(color);
  default: return false;
  }
}

export function sign(value: string, secret: string): string {
  const signed =  value + ':' + createHmac('sha256', secret)
    .update(value)
    .digest('base64')
    .replace(/=+$/, '');
  return signed;
}

export function unsign(value: string, secret: string): string {
  const str = value.slice(0, value.lastIndexOf(':'));
  const mac = sign(str, secret);
  const macBuffer = Buffer.from(mac);
  const valBuffer = Buffer.from(value);
  return timingSafeEqual(macBuffer, valBuffer) ? str : null;
}

export function sign64(value: string, secret: string): string {
  return Buffer.from(sign(value, secret)).toString('base64');
}

export function unsign64(value: string, secret: string): string {
  return unsign(Buffer.from(value, 'base64').toString(), secret);
}

// export async function sizeOfDir(directory: string): Promise<number> {
//   const files = await readdir(directory);
//   let size = 0;
//   for (let i = 0, L = files.length; i !== L; ++i) {
//     const stats = await stat(join(directory, files[i]));
//     size += stats.size;
//   }
//   return size;
// }

export function parseByte(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let num = 0;
  let isNegative = false;
  if (bytes < 0) {
    bytes *= -1;
    isNegative = true;
  }
  while (bytes > 1024) {
    bytes /= 1024;
    ++num;
  }
  if (num >= units.length) {
    bytes *= (1024 ** (units.length - num + 1));
    num = units.length - 1;
  }
  return `${+(isNaN(bytes) ? 0 : isNegative ? -bytes : bytes).toFixed(1)} ${units[num]}`;
}
