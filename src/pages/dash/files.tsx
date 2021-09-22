import Layout from 'components/Layout';
import FilesPage from 'components/pages/Files';
import useLogin from 'lib/hooks/useLogin';
import React from 'react';

export default function Files() {
  const { user, isLoading } = useLogin();
  if (isLoading) return null;
  return (
    <Layout user={user} id={1}>
      <FilesPage/>
    </Layout>
  );
}

Files.title = 'Files';