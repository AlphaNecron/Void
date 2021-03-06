import Layout from 'components/Layout';
import UploadPage from 'components/pages/Upload';
import useLogin from 'lib/hooks/useLogin';
import React from 'react';

export default function Upload() {
  const { user, isLoading } = useLogin();
  if (isLoading) return null;
  return (
    <Layout user={user} id={2}>
      <UploadPage/>
    </Layout>
  );
}

Upload.title = 'Upload';