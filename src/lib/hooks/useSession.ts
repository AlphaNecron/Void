import useFetch from 'lib/hooks/useFetch';
import type {VoidUser} from 'middleware/withVoid';
import {useEffect} from 'react';

type Session = {
  isReady: boolean;
  isLogged: boolean;
  revalidate: (callback?: () => void) => Promise<void>;
  user?: VoidUser;
}

export default function useSession(required = false, onUnauthenticated?: () => void, onAuthenticated?: (user: VoidUser) => void): Session {
  const {
    data,
    error,
    mutate
  } = useFetch('/api/user', {
    refreshInterval: 6e4,
    shouldRetryOnError: false
  });
  useEffect(() => {
    if (error && required && onUnauthenticated)
      onUnauthenticated();
    else if (data && onAuthenticated)
      onAuthenticated(data);
  }, [data, error]);
  return {
    isReady: (data || error) !== undefined,
    isLogged: data !== undefined,
    revalidate: (callback?: () => void) => mutate(null, {
      revalidate: true,
      rollbackOnError: false
    }).then(data => {
      if (data)
        callback();
    }),
    user: data
  };
}
