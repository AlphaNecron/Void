import {useInterval} from '@mantine/hooks';
import axios, {AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse} from 'axios';
import {useState} from 'react';

export function useUpload(endpoint: string, headers: AxiosRequestHeaders, onProgressChanged: ({
  progress,
  speed,
  estimated
}) => void): { upload: (data: FormData) => Promise<AxiosResponse>, onCancel: () => void } {
  let elapsed = 0;
  const ticker = useInterval(() => elapsed++, 1e3);
  const [ctrl, setCtrl] = useState(new AbortController());
  const onDone = () => {
    ticker.stop();
    elapsed = 0;
    onProgressChanged({progress: 0, speed: 0, estimated: 0});
  };
  return {
    upload: async (data) => {
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: endpoint,
        headers,
        signal: ctrl.signal,
        onUploadProgress: (e: ProgressEvent) => {
          const percentage = e.loaded / e.total * 100;
          const speed = e.loaded / 131072 / (elapsed === 0 ? 1 : elapsed);
          onProgressChanged({
            progress: percentage,
            speed,
            estimated: e.total / 1048576 / speed * 8 - elapsed
          });
          if (percentage === 100)
            onDone();
        }
      };
      ticker.start();
      return axios({data, ...config});
    },
    onCancel: () => {
      ctrl.abort('User cancelled the operation.');
      setCtrl(new AbortController());
      onDone();
    }
  };
}
