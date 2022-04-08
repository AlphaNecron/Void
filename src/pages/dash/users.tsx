import Layout from 'components/Layout';
import React from 'react';

export default function Page_Users() {
  return (
    <Layout id={5}>
      Users
    </Layout>
  );
}

Page_Users.title = 'Users';
Page_Users.adminOnly = true;
