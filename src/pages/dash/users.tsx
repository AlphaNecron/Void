import {Autocomplete, Badge, Button, LoadingOverlay, Stack, Text, Title} from '@mantine/core';
import {useModals} from '@mantine/modals';
import CardGrid from 'components/CardGrid';
import Fallback from 'components/Fallback';
import ItemCard from 'components/ItemCard';
import TextPair from 'components/TextPair';
import UserAvatar from 'components/UserAvatar';
import useFetch from 'lib/hooks/useFetch';
import useQuery from 'lib/hooks/useQuery';
import useSession from 'lib/hooks/useSession';
import {request, validateHex} from 'lib/utils';
import {useState} from 'react';
import {FiEdit, FiPlus, FiSearch, FiTrash, FiX} from 'react-icons/fi';

export default function Page_Users() {
  const {data, mutate} = useFetch('/api/admin/users');
  const {query, handler} = useQuery();
  const {openConfirmModal} = useModals();
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const compRole = (a, b) => a.rolePriority > b.rolePriority && a.permissions < b.permissions;
  const deleteUser = (id: string) => request({
    onStart: () => setBusy(true),
    endpoint: '/api/admin/users',
    method: 'DELETE',
    body: {id},
    onDone: () => setBusy(false)
  });
  return (
    <Fallback loaded={data}>
      {() => (
        <Stack>
          <div style={{display: 'flex'}}>
            <Button mr='xs' variant='filled' onClick={() => mutate()} leftIcon={<FiPlus/>}>Create</Button>
            <Autocomplete style={{flex: 1}} value={query} onChange={handler.set}
              data={Array.from(new Set([...data.filter(x => x.name !== null).map(x => x.name), ...data.filter(x => x.username !== null).map(x => x.username), ...data.map(x => x.id), ...data.filter(x => x.email !== null).map(x => x.email)]))}
              icon={<FiSearch/>}/>
          </div>
          <CardGrid itemSize={350}>
            {handler.filterList(data, ['name', 'username', 'email', 'id']).map((user, i) => (
              <ItemCard key={i} actions={[
                {
                  label: 'Edit',
                  icon: <FiEdit/>,
                  color: 'teal',
                  disabled: session.user?.id === user.id || compRole(session.user?.role, user.role),
                  action: () => console.log('edit')
                },
                {
                  label: 'Delete',
                  icon: <FiTrash/>,
                  color: 'red',
                  busy,
                  disabled: session.user?.id === user.id || compRole(session.user?.role, user.role),
                  action: () => {
                    openConfirmModal({
                      title: 'Are you sure you want to delete this user?',
                      children: (
                        <Stack align='center'>
                          <UserAvatar user={user} size={96}/>
                          <Title order={4}>
                            {user.name || user.username || user.id}
                          </Title>
                        </Stack>
                      ),
                      labels: {confirm: 'Delete', cancel: 'Cancel'},
                      confirmProps: {color: 'red', leftIcon: <FiTrash/>},
                      onConfirm: () => deleteUser(user.id),
                      cancelProps: {leftIcon: <FiX/>}
                    });
                  }
                }
              ]}>
                <div style={{display: 'flex', alignItems: 'center', margin: 16}}>
                  <Stack spacing={6} align='center'>
                    <UserAvatar size={80} user={user}/>
                    <Badge
                      sx={({fn}) => validateHex(user.role.color) ? {background: fn.rgba(user.role.color, 0.5)} : {}}>
                      <Text sx={({ colorScheme }) => ({ fontSize: 11, color: colorScheme === 'dark' ? 'white' : '#484848' })}>
                        {user.role.name}
                      </Text>
                    </Badge>
                  </Stack>
                  <Stack ml='xl' spacing={2}>
                    {[['ID', user.id], ['Username', user.username], ['Display name', user.name], ['Email', user.email]].map(([x, y]) =>
                      <TextPair label={x} value={y || <span style={{color: 'gray'}}>Unset</span>} key={x}/>)}
                  </Stack>
                </div>
              </ItemCard>
            ))}
          </CardGrid>
        </Stack>
      )}
    </Fallback>
  );
}

Page_Users.title = 'Users';
Page_Users.adminOnly = true;
