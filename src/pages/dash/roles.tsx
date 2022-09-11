import {
  Alert,
  Badge,
  Button,
  ColorInput,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  TransferList,
  useMantineTheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import {openModal} from '@mantine/modals';
import ConfirmButton from 'components/ConfirmButton';
import Fallback from 'components/Fallback';
import List from 'components/List';
import UserAvatar from 'components/UserAvatar';
import Dialog_AddToRole from 'dialogs/AddToRole';
import Dialog_CreateRole from 'dialogs/CreateRole';
import useFetch from 'lib/hooks/useFetch';
import useRequest from 'lib/hooks/useRequest';
import useSession from 'lib/hooks/useSession';
import {showError, showSuccess} from 'lib/notification';
import {highest, Permission} from 'lib/permission';
import {prettyBytes, validateHex} from 'lib/utils';
import {useEffect, useMemo} from 'react';
import {FiPlus, FiSave, FiTrash} from 'react-icons/fi';
import {RiAlertFill, RiCheckFill, RiDeleteBinFill, RiErrorWarningFill} from 'react-icons/ri';

function Color({color}) {
  return <div
    style={{background: validateHex(color) ? color : 'white', width: 16, height: 16, borderRadius: '100%'}} />;
}

type Role = {
  id: string;
  name: string;
  color: string;
  permissions: number[];
  maxFileSize: number;
  maxFileCount: number;
  storageQuota: number;
  maxRefCodes: number;
  users: { id: string, username: string }[];
}

export default function Page_Roles() {
  const {user} = useSession();
  const {data, mutate} = useFetch<{ availablePerms: number[], roles: Role[] }>('/api/admin/roles');
  const {breakpoints} = useMantineTheme();
  const {busy, request} = useRequest();
  const isSmall = useMediaQuery(`(max-width: ${breakpoints.xs}px)`);
  const form = useForm<{ roles: Role[] }>();
  useEffect(() => {
    if (data)
      form.setValues({roles: data.roles});
  }, [data]);
  const [opened, handler] = useDisclosure(false);
  const userUltimatePermission = useMemo(() => highest(user.role.permissions), [user.role]);
  const toItem = (s: number) => ({label: Permission[s], value: s.toString()});

  const handleDelete = (role: Role) => {
    if (!role) return;
    request({
      endpoint: '/api/admin/roles',
      method: 'DELETE',
      body: {id: role.id},
      callback: () => showSuccess((
        <>
          Successfully deleted role
          <span style={{color: validateHex(role.color) && role.color, fontWeight: 700}}> {role.name}</span>
          .
        </>
      ), <RiDeleteBinFill />),
      onError: e => showError(e, <RiErrorWarningFill />),
      onDone: () => mutate()
    });
  };
  const handleSubmit = (role: Role) => {
    if (!role) return;
    request({
      endpoint: '/api/admin/roles',
      method: 'PATCH',
      body: {
        ...role,
        permissions: role.permissions.reduce((a, b) => a | b, 0)
      },
      callback: () => showSuccess((
        <>
          Successfully updated role
          <span style={{color: validateHex(role.color) && role.color, fontWeight: 700}}> {role.name}</span>
          .
        </>
      ), <RiCheckFill />),
      onError: e => showError(e, <RiErrorWarningFill />),
      onDone: () => mutate()
    });
  };
  return (
    <Fallback loaded={form.values.roles && form.values.roles.length === data.roles.length}>
      {() => (
        <>
          <Dialog_CreateRole callback={mutate} highestPerm={userUltimatePermission} opened={opened}
            onClose={handler.close} />
          <Tabs styles={({spacing}) => ({
            tab: {
              [!isSmall && 'width']: 150,
              fontWeight: 600
            },
            tabsList: {
              display: isSmall ? '' : 'table-cell'
            },
            panel: {
              [isSmall ? 'paddingTop' : 'paddingLeft']: spacing.md
            }
          })} orientation={isSmall ? 'horizontal' : 'vertical'} style={{height: '100%'}}
          defaultValue={data.roles[0].id}>
            <div style={{display: 'flex', gap: 8, flexDirection: isSmall ? 'row' : 'column'}}>
              <Button fullWidth={!isSmall} leftIcon={<FiPlus />} variant='default' onClick={handler.open}>New
                role</Button>
              <ScrollArea scrollbarSize={2} offsetScrollbars style={{flex: 1}} styles={isSmall ? {} : ({
                viewport: {
                  '&>div': {
                    height: '100%'
                  }
                }
              })}>
                <Tabs.List grow>
                  {data.roles.map(({id, name, color}) => (
                    <Tabs.Tab key={id} value={id}
                      icon={<Color color={color} />}>
                      {name}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </ScrollArea>
            </div>
            {form.values.roles && form.values.roles.map((role, i) => {
              const isCurrent = user.role.name === role.name;
              const isHigher = userUltimatePermission <= data.roles[i].permissions[data.roles[i].permissions.length - 1] && !isCurrent;
              const canEdit = !(isCurrent || isHigher);
              const getListProp = (prop: keyof Role) => form.getInputProps(`roles.${i}.${prop}`);
              const setListProp = (prop: keyof Role, value) => form.setFieldValue(`roles.${i}.${prop}`, value);
              return (
                <Tabs.Panel key={i} value={data.roles[i].id}>
                  <form onSubmit={form.onSubmit(({roles}) => handleSubmit(roles[i]))}>
                    <Stack>
                      {isCurrent && (
                        <Alert title='Disclaimer' variant='outline' color='yellow' icon={<RiAlertFill />}>
                          This is your current role, so you are not allowed to modify it.
                        </Alert>
                      )}
                      {isHigher && (
                        <Alert title='Disclaimer' color='red' variant='outline' icon={<RiAlertFill />}>
                          This role is higher than yours so you are not allowed to modify it.
                        </Alert>
                      )}
                      <TextInput disabled={!canEdit} label='Name' {...getListProp('name')} required />
                      <ColorInput disabled={!canEdit} label='Color' {...getListProp('color')} required />
                      <NumberInput disabled={!canEdit} rightSectionWidth={84}
                        rightSection={<Badge radius='xs' color='dark' mr='xs'
                          fullWidth>{prettyBytes(role.storageQuota)}</Badge>}
                        label='Storage quota (maximum total size)' min={1048576}
                        step={1048576} {...getListProp('storageQuota')} required />
                      <NumberInput disabled={!canEdit} rightSectionWidth={84}
                        rightSection={<Badge radius='xs' color='dark' mr='xs'
                          fullWidth>{prettyBytes(role.maxFileSize)}</Badge>}
                        label='Max file size per upload (in bytes)' min={1048576}
                        step={1048576} {...getListProp('maxFileSize')} required />
                      <NumberInput disabled={!canEdit} label='Max files per upload'
                        min={1} {...getListProp('maxFileCount')} required />
                      <NumberInput disabled={!canEdit} label='Max referral codes' {...getListProp('maxRefCodes')}
                        required />
                      <div>
                        <Text size='xs' mb={4}>Permissions</Text>
                        {canEdit ? (
                          <TransferList breakpoint='xs' showTransferAll={false}
                            value={[role.permissions.map(toItem), data.availablePerms.filter(perm => !role.permissions.includes(+perm)).map(toItem)]}
                            onChange={values => setListProp('permissions', (values as { value: string; }[][])[0].map(({value}) => +value))} />
                        ) : (
                          <List items={role.permissions}>
                            {perm => (
                              <Text weight={700} style={{
                                flex: 1,
                                maxWidth: 350,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {Permission[perm]}
                              </Text>
                            )}
                          </List>
                        )}
                      </div>
                      <div>
                        <Text size='xs' mb={4}>Members</Text>
                        <List items={filter => role.users.filter(u => filter(u.username))}
                          onAdd={canEdit && (() => openModal({
                            modalId: 'addToRole',
                            title: (
                              <>
                                <span>Add users to </span>
                                <span style={{color: validateHex(role.color) && role.color}}>{role.name}</span>
                              </>
                            ),
                            children: <Dialog_AddToRole id={role.id} callback={mutate} />
                          }))}>
                          {user => (
                            <Group>
                              <UserAvatar user={{
                                ...user,
                                role
                              }} size={20} />
                              <Text weight={700} style={{
                                maxWidth: '90%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {user.username}
                              </Text>
                            </Group>
                          )}
                        </List>
                      </div>
                    </Stack>
                    {canEdit && (
                      <Button.Group style={{position: 'fixed', bottom: 32, right: 32}}>
                        <ConfirmButton loading={busy} leftIcon={<FiTrash />} variant='filled' color='red'
                          onClick={() => handleDelete(role)}>
                          Delete
                        </ConfirmButton>
                        <Button type='submit' loading={busy}
                          leftIcon={<FiSave />}
                          variant='default'>
                          Save
                        </Button>
                      </Button.Group>
                    )}
                  </form>
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </>
      )}
    </Fallback>
  );
}

Page_Roles.title = 'Roles';
Page_Roles.adminOnly = true;
