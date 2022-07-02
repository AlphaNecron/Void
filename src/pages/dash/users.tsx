import {Autocomplete, Button, LoadingOverlay, Stack} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import ItemCard from 'components/ItemCard';
import TextPair from 'components/TextPair';
import UserAvatar from 'components/UserAvatar';
import useQuery from 'lib/hooks/useQuery';
import React from 'react';
import {FiEdit, FiRefreshCw, FiSearch, FiTrash} from 'react-icons/fi';
import useSWR from 'swr';

export default function Page_Users() {
  const {data, mutate} = useSWR('/api/users', (url: string) => fetch(url).then(r => r.json()));
  const {query, handler} = useQuery();
  const deleteUser = () => fetch('/api/users');
  return data ? (
    <Stack>
      {data?.length > 0 && (
        <div style={{display: 'flex'}}>
          <Autocomplete style={{flex: 1}} value={query} onChange={handler.set}
            data={Array.from(new Set([...data.filter(x => x.name !== null).map(x => x.name), ...data.filter(x => x.username !== null).map(x => x.username), ...data.map(x => x.id), ...data.filter(x => x.email !== null).map(x => x.email)]))}
            icon={<FiSearch/>}/>
          <Button ml='xs' variant='filled' onClick={() => mutate()} leftIcon={<FiRefreshCw/>}>Refresh</Button>
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
            <div style={{display: 'flex', alignItems: 'center', margin: 16}}>
              <UserAvatar size={80} user={user}/>
              <Stack ml='xl' spacing={2}>
                {[['ID', user.id], ['Username', user.username], ['Name', user.name], ['Email', user.email]].map(([x, y]) =>
                  <TextPair label={x} value={y || <span style={{color: 'lime'}}>Unset</span>} key={x}/>)}
              </Stack>
            </div>
          </ItemCard>
        ))}
      </CardGrid>
    </Stack>
  ) : <LoadingOverlay visible/>;
}

Page_Users.title = 'Users';
Page_Users.adminOnly = true;
