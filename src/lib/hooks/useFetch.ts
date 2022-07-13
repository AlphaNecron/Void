import useSWR, {BareFetcher, SWRResponse} from 'swr';
import {PublicConfiguration} from 'swr/dist/types';

export default function useFetch<T = any>(endpoint: string,
  options?: Partial<PublicConfiguration<T, { code: number, error: string } | Error, BareFetcher<T>>>): SWRResponse<T> {
  return useSWR<T>(endpoint, (url: string) => fetch(url).then(r => r.json().then(r => {
    if (r.error) throw new Error(r.error);
    return r;
  })), options);
}
