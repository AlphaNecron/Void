import Layout from 'components/Layout';
import URLs from 'components/pages/Urls';
import useLogin from 'lib/hooks/useLogin';
import React from 'react';

export default function Urls() {
  const { user, isLoading } = useLogin();
  if (isLoading) return null;
  return (
    <Layout user={user} id={3}>
      <URLs/>
    </Layout>
  );
}

Urls.title = 'URLs';