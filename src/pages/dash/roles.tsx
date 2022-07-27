import {
  Affix,
  Alert,
  Badge,
  Button,
  ColorInput,
  LoadingOverlay,
  Modal,
  NumberInput, ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  TransferList,
  useMantineTheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import Fallback from 'components/Fallback';
import List from 'components/List';
import useFetch from 'lib/hooks/useFetch';
import useSession from 'lib/hooks/useSession';
import {Permission} from 'lib/permission';
import {prettyBytes, validateHex} from 'lib/utils';
import {useEffect, useMemo} from 'react';
import {FiPlus} from 'react-icons/fi';
import {RiAlertFill} from 'react-icons/ri';

function Color({color}) {
  return <div style={{background: validateHex(color) ? color : 'white', width: 16, height: 16, borderRadius: '100%'}}/>;
}

type Role = {
  name: string;
  color: string;
  rolePriority: number;
  permissions: string[];
  maxFileSize: number;
  maxFileCount: number;
  storageQuota: number;
  users: { username: string }[];
  permissionInteger: number;
}

export default function Page_Roles() {
  const {user} = useSession();
  const {data} = useFetch<Role[]>('/api/admin/roles');
  const {breakpoints} = useMantineTheme();
  const isSmall = useMediaQuery(`(max-width: ${breakpoints.sm}px)`);
  const form = useForm<{ roles: Role[] }>();
  useEffect(() => {
    if (data)
      form.setValues({roles: data});
    console.log(form.values);
  }, [data]);
  const [opened, handler] = useDisclosure(false);
  const allPerms = useMemo(() => Object.values(Permission).filter(p => typeof p === 'string') as string[], []);
  const toItem = (s: string) => ({label: s, value: s});
  return (
    <Fallback loaded={form.values.roles && form.values.roles.length === data.length}>
      {() => (
        <>
          <Modal opened={opened} onClose={handler.close} title='Create a new role'></Modal>
          <Tabs styles={({spacing}) => ({
            tab: {
              minWidth: 125, justifyContent: 'center', fontWeight: 600
            },
            panel: {
              [isSmall ? 'paddingTop' : 'paddingLeft']: spacing.md
            }
          })} orientation={isSmall ? 'horizontal' : 'vertical'} style={{height: '100%'}}
          defaultValue={form.values.roles[0].name}>
            <Tabs.List grow={isSmall}>
              {data.map((role, i) => (
                <Tabs.Tab key={i} value={role.name}
                  icon={<Color color={role.color}/>}>
                  {role.name}
                </Tabs.Tab>
              )
              )}
            </Tabs.List>
            {form.values.roles && form.values.roles.map((role, i) => {
              const isCurrent = user.role.name === role.name;
              const isHigher = role.rolePriority <= user.role.rolePriority && !isCurrent;
              const canEdit = !(isCurrent || isHigher);
              const getListProp = (prop: keyof Role) => form.getInputProps(`roles.${i}.${prop}`);
              const setListProp = (prop: keyof Role, value) => form.setFieldValue(`roles.${i}.${prop}`, value);
              return (
                <Tabs.Panel key={i} value={data[i].name}>
                  <Stack>
                    {isCurrent && (
                      <Alert title='Small reminder' variant='outline' color='yellow' icon={<RiAlertFill/>}>
                        This is your current role, so you are not allowed to modify it.
                      </Alert>
                    )}
                    {isHigher && (
                      <Alert title='Note' color='red' variant='outline' icon={<RiAlertFill/>}>
                        This role is higher than yours so you are not allowed to modify it.
                      </Alert>
                    )}
                    <TextInput disabled={!canEdit} label='Name' {...getListProp('name')}/>
                    <ColorInput disabled={!canEdit} label='Color' {...getListProp('color')}/>
                    <NumberInput disabled={!canEdit} label='Priority' min={user.role.rolePriority + 1}
                      {...getListProp('rolePriority')}/>
                    <NumberInput disabled={!canEdit} hideControls={false} rightSectionWidth={72} rightSection={
                      <Badge radius='xs' color='dark' mr='xs' fullWidth>{prettyBytes(role.maxFileSize)}</Badge>
                    } label='Max file size (in bytes)'
                    defaultValue={role.maxFileSize} min={107374182} step={1048576}/>
                    <div>
                      <Text size='xs' mb={4}>Permissions</Text>
                      {canEdit ? (
                        <TransferList breakpoint='sm' showTransferAll={false}
                          value={[role.permissions.map(toItem), allPerms.filter(perm => !role.permissions.includes(perm)).map(toItem)]}
                          onChange={values => setListProp('permissions', {
                            ...role,
                            permissions: (values as { value: string }[][])[0].map(({value}) => value)
                          })}/>
                      ) : (
                        <List items={role.permissions}>
                          {perm => (
                            <Text weight={700} style={{
                              maxWidth: 350,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {perm}
                            </Text>
                          )}
                        </List>
                      )}
                    </div>
                    <div>
                      <Text size='xs' mb={4}>Members</Text>
                      {canEdit ? (
                        <></>
                      ) : (
                        <List items={role.users}>
                          {user => (
                            <Text weight={700} style={{
                              maxWidth: 350,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {user.username}
                            </Text>
                          )}
                        </List>
                      )}
                    </div>
                  </Stack>
                </Tabs.Panel>
              );
            })}
          </Tabs>
          <Affix zIndex={0} position={{bottom: 32, right: 32}}>
            <Button leftIcon={<FiPlus/>} onClick={handler.open}>New role</Button>
          </Affix>
        </>
      )}
    </Fallback>
  );
}

Page_Roles.title = 'Roles';
Page_Roles.adminOnly = true;
