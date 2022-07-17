import {mimetypes} from './constants';

export function getMimetype(extension: string): string {
  return mimetypes[`.${extension}`];
}

export function getType(mimetype: string): string {
  const type = mimetype?.trim().split('/').shift();
  if (['application/json', 'application/xml', 'application/x-sh', 'application/ld+json', 'application/x-csh', 'application/x-javascript'].includes(mimetype) || type === 'text')
    return 'text';
  return type;
}

export function isPreviewable(mimetype: string): boolean {
  return ['audio', 'image', 'video', 'text'].includes(getType(mimetype));
}

export function isType(type: 'audio' | 'image' | 'video' | 'text', mimetype: string): boolean {
  return getType(mimetype) === type;
}
