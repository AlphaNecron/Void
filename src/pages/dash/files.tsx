import React from 'react';
import Layout from 'components/Layout';
import useLogin from 'lib/hooks/useLogin';
import FilesPage from 'components/pages/Files';

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