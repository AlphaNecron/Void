import {Button, LoadingOverlay} from '@mantine/core';
import React from 'react';
import useSWR from 'swr';

/// TODO: MERGE ADMINISTRATIVE PAGES ALTOGETHER
export default function Page_Roles() {
  const { data, mutate } = useSWR('/api/admin/roles', (url: string) => fetch(url).then(r => r.json()));
  return data ? (
    data.map(role => (
      <Button key={role.name}>{JSON.stringify(role)}</Button>
    ))
  ) : <LoadingOverlay visible/>;
}

Page_Roles.title = 'Roles';
Page_Roles.adminOnly = true;
