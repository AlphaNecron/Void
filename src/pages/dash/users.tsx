import {Autocomplete, Avatar, LoadingOverlay, Stack, Text} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import ItemCard from 'components/ItemCard';
import Layout from 'components/Layout';
import useQuery from 'lib/hooks/useQuery';
import React from 'react';
import {FiEdit, FiSearch, FiTrash} from 'react-icons/fi';
import useSWR from 'swr';

export default function Page_Users() {
  const { data, mutate } = useSWR('/api/users', (url: string) => fetch(url).then(r => r.json()));
  const { query, handler } = useQuery();
  const createText = (label: string, value: string) => (
    <Text size='sm' weight={700} color='dimmed'>
      {label}: <Text size='sm' style={{ display: 'inline' }} color='white'>{value}</Text>
    </Text>
  );
  return data ? (
    <Layout id={5} onReload={mutate}>
      <Stack>
        {data?.length > 0 && (
          <div style={{ display: 'flex' }}>
            <Autocomplete style={{ flex: 1 }} value={query} onChange={handler.set} data={Array.from(new Set([...data.filter(x => x.name !== null).map(x => x.name), ...data.filter(x => x.username !== null).map(x => x.username), ...data.map(x => x.id), ...data.filter(x => x.email !== null).map(x => x.email)]))} icon={<FiSearch/>}/>
          </div>
        )}
        <CardGrid itemSize={350}>
          {handler.filterList(data, ['name', 'username', 'email', 'id']).map((user, i) => (
            <ItemCard key={i} actions={[
              {
                label: 'Edit',
                icon: <FiEdit/>,
                color: 'blue',
                action: () => console.log('edit')
              }, {
                label: 'Delete',
                icon: <FiTrash/>,
                color: 'red',
                action: () => console.error('delete')
              }
            ]}>
              <div style={{ display: 'flex', alignItems: 'center', margin: 16 }}>
                <Avatar src={user.image} size={80} radius={100}/>
                <Stack ml='xl' spacing={2}>
                  {[['ID', user.id], ['Username', user.username], ['Name', user.name], ['Email', user.email]].map(x => createText(x[0], x[1] || <strong style={{ color: 'white' }}>Unset</strong>))}
                </Stack>
              </div>
            </ItemCard>
          ))}
        </CardGrid>
      </Stack>
    </Layout>
  ) : <LoadingOverlay visible/>;
}

Page_Users.title = 'Users';
Page_Users.adminOnly = true;
