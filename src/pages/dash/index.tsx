import Layout from 'components/Layout';
import Dash from 'components/pages/Dashboard';
import useLogin from 'lib/hooks/useLogin';
import React from 'react';

export default function Dashboard() {
  const { user, isLoading } = useLogin();
  if (isLoading) return null;
  return (
    <Layout user={user} id={0}>
      <Dash/>
    </Layout>
  );
}

Dashboard.title = 'Dashboard';