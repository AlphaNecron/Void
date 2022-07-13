import type {IronSessionData} from 'iron-session';
import useFetch from 'lib/hooks/useFetch';
import type {VoidUser} from 'middleware/withVoid';
import {useEffect} from 'react';

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
  } = useFetch('/api/user', {
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
