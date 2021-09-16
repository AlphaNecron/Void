import React from 'react';
import Dash from 'components/pages/Dashboard';
import Layout from 'components/Layout';
import useLogin from 'lib/hooks/useLogin';

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