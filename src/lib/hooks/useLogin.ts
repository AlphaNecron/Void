import { updateUser, User } from 'lib/redux/reducers/user';
import { useStoreDispatch, useStoreSelector } from 'lib/redux/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useFetch from './useFetch';

export default function login() {
  const router = useRouter();
  const dispatch = useStoreDispatch();
  const userState = useStoreSelector(s => s.user);
  const [user, setUser] = useState<User>(userState);
  const [isLoading, setIsLoading] = useState<boolean>(!userState);

  async function load() {
    setIsLoading(true);
    const res = await useFetch('/api/user');
    if (res.error) return router.push('/auth/login');
    dispatch(updateUser(res));
    setUser(res);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!isLoading && user) return;
    load();
  }, []);

  return { isLoading, user };
}