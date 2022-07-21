import {
  Affix,
  Alert,
  Badge,
  Button,
  ColorInput,
  LoadingOverlay,
  Modal,
  NumberInput,
  Stack,
  Tabs,
  Text,
  TextInput,
  TransferList,
  useMantineTheme
} from '@mantine/core';
import {formList, useForm} from '@mantine/form';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import List from 'components/List';
import useFetch from 'lib/hooks/useFetch';
import useSession from 'lib/hooks/useSession';
import {Permission} from 'lib/permission';
import {prettyBytes, validateHex} from 'lib/utils';
import {useMemo} from 'react';
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
  const form = useForm({
    initialValues: {
      roles: formList(data || [])
    }
  });
  const [opened, handler] = useDisclosure(false);
  const allPerms = useMemo(() => Object.values(Permission).filter(p => typeof p === 'string') as string[], []);
  const toItem = (s: string) => ({label: s, value: s});
  return form.values.roles.length > 0 ? (
    <>
      <Modal opened={opened} onClose={handler.close} title='Create a new role'></Modal>
      <Tabs grow orientation={isSmall ? 'horizontal' : 'vertical'} variant='pills' styles={({fontSizes: {md}}) => ({
        tabInner: {
          fontSize: md,
          fontWeight: 600,
          margin: '2px 16px'
        },
        tabsListWrapper: {
          overflow: 'scroll'
        }
      })}>
        {form.values.roles.map((role, i) => {
          const isCurrent = user.role.name === role.name;
          const isHigher = role.rolePriority <= user.role.rolePriority && !isCurrent;
          const canEdit = !(isCurrent || isHigher);
          return (
            <Tabs.Tab key={i} label={role.name} icon={<Color color={role.color}/>}>
              <Stack style={{overflow: 'scroll'}}>
                {isCurrent && (
                  <Alert title='Small reminder' color='yellow' icon={<RiAlertFill/>}>
                    This is your current role, so you are not allowed to modify it.
                  </Alert>
                )}
                {isHigher && (
                  <Alert title='Note' color='red' icon={<RiAlertFill/>}>
                    This role is higher than yours so you are not allowed to modify it.
                  </Alert>
                )}
                <TextInput disabled={!canEdit} label='Name'/>
                <ColorInput disabled={!canEdit} label='Color'/>
                <NumberInput disabled={!canEdit} label='Priority' min={user.role.rolePriority + 1}
                  {...form.getListInputProps('roles', i, 'rolePriority')}/>
                <NumberInput disabled={!canEdit} hideControls={false} rightSectionWidth={72} rightSection={
                  <Badge radius='xs' color='dark' mr='xs' fullWidth>{prettyBytes(role.maxFileSize)}</Badge>
                } label='Max file size (in bytes)'
                defaultValue={role.maxFileSize} min={107374182} step={1048576}/>
                <div>
                  <Text size='xs' mb={4}>Permissions</Text>
                  {canEdit ? (
                    <TransferList showTransferAll={false}
                      value={[role.permissions.map(toItem), allPerms.filter(perm => !role.permissions.includes(perm)).map(toItem)]}
                      onChange={values => form.setListItem('roles', i, {
                        ...role,
                        permissions: (values as { value: string }[][])[0].map(({ value }) => value)
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
            </Tabs.Tab>
          );
        })}
      </Tabs>
      <Affix zIndex={0} position={{bottom: 32, right: 32}}>
        <Button leftIcon={<FiPlus/>} onClick={handler.open}>New role</Button>
      </Affix>
    </>
  ) : <LoadingOverlay visible/>;
}

Page_Roles.title = 'Roles';
Page_Roles.adminOnly = true;
