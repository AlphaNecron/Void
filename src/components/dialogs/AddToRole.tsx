import { Button, Checkbox, Group, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { closeModal } from '@mantine/modals';
import UserAvatar from 'components/UserAvatar';
import useFetch from 'lib/hooks/useFetch';
import useQuery from 'lib/hooks/useQuery';
import useRequest from 'lib/hooks/useRequest';
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

export default function Dialog_AddToRole({id, callback}) {
  const {data} = useFetch(`/api/admin/roleUsers?id=${id}`, {
    revalidateOnFocus: false
  });
  const {busy, request} = useRequest();
  const {query, handler} = useQuery();
  const [selected, setSelected] = useState<string[]>([]);
  const add = () =>
    request({
      endpoint: '/api/admin/roleUsers',
      method: 'PATCH',
      body: {
        id,
        users: selected
      },
      onDone() {
        closeModal('addToRole');
        callback();
      }
    });
  return (
    <Stack spacing='sm'>
      <TextInput icon={<FiSearch />} placeholder='Search a user' value={query}
        onChange={e => handler.set(e.target.value)} />
      <ScrollArea>
        <Checkbox.Group spacing='xs' mt='-xs' orientation='vertical' value={selected} onChange={setSelected}>
          {data && handler.filterList(data, ['name']).map(user => (
            <Checkbox value={user.id} key={user.id} label={
              <Group spacing='xs'>
                <UserAvatar user={user} size={28} />
                {user.name && (
                  <Text weight={700}>
                    {user.name}
                  </Text>
                )}
                <Text weight={700} color={user.name && 'dimmed'} style={{
                  maxWidth: '90%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.username}
                </Text>
              </Group>
            } />
          ))}
        </Checkbox.Group>
      </ScrollArea>
      <Button disabled={selected.length === 0} onClick={add} loading={busy}>
        Add {selected.length} user{selected.length > 1 && 's'}
      </Button>
    </Stack>
  );
}
