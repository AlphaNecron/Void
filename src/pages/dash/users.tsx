import Layout from 'components/Layout';
import UserPage from 'components/pages/Users';
import useLogin from 'lib/hooks/useLogin';
import React from 'react';

export default function Users() {
  const { user, isLoading } = useLogin();
  if (isLoading) return null;
  return (
    <Layout user={user} id={3}>
      <UserPage/>
    </Layout>
  );
}

Users.title = 'Users';