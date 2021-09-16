import React from 'react';
import Layout from 'components/Layout';
import useLogin from 'lib/hooks/useLogin';

export default function Files() {
  const { user, isLoading } = useLogin();
  if (isLoading) return null;
  return (
    <Layout user={user} id={1}>
      
    </Layout>
  );
}

Files.title = 'Files';