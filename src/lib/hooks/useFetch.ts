import useSWR, { BareFetcher, SWRResponse } from 'swr';
import { PublicConfiguration } from 'swr/dist/types';
import type { VoidError } from 'middleware/withVoid';

type Err = VoidError | Error

export default function useFetch<T = any>(endpoint: string,
  options?: Partial<PublicConfiguration<T, Err, BareFetcher<T>>>): SWRResponse<T, Err> {
  return useSWR<T>('window' in global ? endpoint : null, (url: string) =>
    fetch(url).then(r => r.json()).then(r => {
      if (r.error) throw new Error(r.error || 'Unknown error occurred');
      return r;
    }), {suspense: true, ...options});
}
