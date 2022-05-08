import {Button, LoadingOverlay} from '@mantine/core';
import Layout from 'components/Layout';
import React from 'react';
import useSWR from 'swr';

export default function Page_Roles() {
  const { data, mutate } = useSWR('/api/admin/roles', (url: string) => fetch(url).then(r => r.json()));
  return data ? (
    <Layout id={6} onReload={mutate}>
      {data.map(role => (
        <Button key={role.name}>{role.name}</Button>
      ))}
    </Layout>
  ) : <LoadingOverlay visible/>;
}

Page_Roles.title = 'Roles';
Page_Roles.adminOnly = true;
