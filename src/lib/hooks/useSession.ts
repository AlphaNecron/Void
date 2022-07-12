import type {IronSessionData} from 'iron-session';
import type {VoidUser} from 'middleware/withVoid';
import {useEffect} from 'react';
import useSWR from 'swr';

type Session = {
  isReady: boolean;
  isLogged: boolean;
  mutate: () => void;
} & IronSessionData

type SessionEvent = {
  type: 'logout' | 'login' | 'refresh' | 'err';
}

export default function useSession(required = false, onUnauthenticated?: () => void, onAuthenticated?: (user: VoidUser) => void): Session {
  const {
    data,
    error,
    mutate
  } = useSWR<VoidUser>('/api/user', (url: string) => fetch(url).then(r => r.json()).then(r => {
    if (r.error) throw new Error(r.error);
    return r;
  }), {
    refreshInterval: 6e4
  });
  useEffect(() => {
    if (error && required && onUnauthenticated)
      onUnauthenticated();
    else if (data && onAuthenticated)
      onAuthenticated(data);
  }, [data, error, required]);
  return {
    isReady: data || error,
    isLogged: data !== undefined,
    mutate,
    user: data
  };
}
