import {noop} from 'lib/constants';
import useBusy from 'lib/hooks/useBusy';
import {HttpMethod} from 'undici/types/dispatcher';

interface FetchParameters {
  onStart?: () => void;
  endpoint: string;
  method?: HttpMethod;
  onError?: (err) => void;
  onDone?: () => void;
  signal?: AbortSignal;
  body?;
  headers?: Record<string, string>;
  callback?: (response) => void;
}

type UseRequest = {
  busy: boolean;
  request: (params: FetchParameters) => Promise<void>;
}

export default function useRequest(): UseRequest {
  const {busy, set} = useBusy();
  return {
    busy,
    request({
      onStart,
      endpoint,
      method,
      callback = noop,
      headers,
      onDone = noop,
      body,
      onError = noop,
      signal
    }: FetchParameters): Promise<void> {
      const isFormData = body instanceof FormData;
      if (onStart)
        onStart();
      set(true);
      return fetch(endpoint, {
        method: method || 'GET',
        headers: {...(!isFormData && {'Content-Type': 'application/json'}), ...headers},
        signal,
        body: isFormData ? body : JSON.stringify(body)
      }).then(r => r.json()).then(r => {
        if (r.error)
          throw new Error(r.error);
        return r;
      }).then(callback).catch(e => onError(e.message || e.name)).finally(() => {
        set(false);
        onDone();
      });
    }
    
  };
}
