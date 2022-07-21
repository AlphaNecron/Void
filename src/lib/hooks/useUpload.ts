import {useInterval} from '@mantine/hooks';
import useAbort from 'lib/hooks/useAbort';

export default function useUpload(endpoint: string, headers: Record<string, string>, onProgressChanged: ({
  canMeasure,
  progress,
  speed,
  estimated
}) => void, onError: (message: string) => void, onUploaded: (response: any) => void): { upload: (data: FormData) => void, onCancel: () => void } {
  let elapsed = 0;
  const ticker = useInterval(() => elapsed++, 1e3);
  const { renew, abort, onAbort } = useAbort();
  const handlers = (req: XMLHttpRequest) => {
    const eventHandlers = {
      'loadstart': () => {
        elapsed = 0;
        ticker.start();
      },
      'progress': (e: ProgressEvent) => {
        const percentage = e.loaded / e.total * 100;
        const speed = e.loaded / 131072 / (elapsed === 0 ? 1 : elapsed);
        onProgressChanged({
          canMeasure: e.lengthComputable,
          progress: percentage,
          speed,
          estimated: (e.total - e.loaded) / 1048576 / speed * 8
        });
      },
      'loadend': () => {
        ticker.stop();
        elapsed = 0;
        onProgressChanged({canMeasure: false, progress: 0, speed: 0, estimated: 0});
      },
      'error': () => onError('Unknown error occurred.'),
      'abort': () => onError('User aborted the upload.'),
      'timeout': () => onError('Request timed out.')
    };
    return {
      register: () => {
        req.onload = () => {
          if (req.status >= 400)
            onError(req.response.error);
          else onUploaded(req.response);
          renew();
        };
        Object.entries(eventHandlers).forEach(([event, handler]) => req.upload[`on${event}`] = handler);
      }
    };
  };
  return {
    async upload(data) {
      if (!ticker.active) {
        const req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('POST', '/api/upload', true);
        for (const [key, value] of Object.entries(headers))
          req.setRequestHeader(key, value);
        onAbort(() =>
          req.abort());
        handlers(req).register();
        req.send(data);
      }
    },
    onCancel: () => abort()
  };
}
