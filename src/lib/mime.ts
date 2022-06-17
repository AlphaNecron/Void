import {mimetypes} from './constants';

export function getMimetype(extension: string): string {
  return mimetypes[`.${extension}`];
}

export function getType(mimetype: string): string {
  return mimetype?.trim().split('/').shift();
}

export function isText(mimetype: string): boolean {
  return isType('text', mimetype) || ['application/json', 'application/xml', 'application/x-sh', 'application/ld+json', 'application/x-csh', 'application/x-javascript'].includes(mimetype);
}

export function isPreviewable(mimetype: string): boolean {
  return ['audio', 'image', 'video'].includes(getType(mimetype)) || isText(mimetype);
}

export function isType(type: 'audio' | 'image' | 'video' | 'text', mimetype: string): boolean {
  return getType(mimetype) === type;
}
