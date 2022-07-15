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
  useMantineTheme
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import List from 'components/List';
import useFetch from 'lib/hooks/useFetch';
import useSession from 'lib/hooks/useSession';
import {prettyBytes, validateHex} from 'lib/utils';
import {FiPlus} from 'react-icons/fi';
import {RiAlertFill} from 'react-icons/ri';

function Color({color}) {
  return <div style={{background: validateHex(color) ? color : 'white', width: 16, height: 16, borderRadius: '100%'}}/>;
}

export default function Page_Roles() {
  const {user} = useSession();
  const {data} = useFetch('/api/admin/roles');
  const {breakpoints} = useMantineTheme();
  const isSmall = useMediaQuery(`(max-width: ${breakpoints.sm}px)`);
  const [opened, handler] = useDisclosure(false);
  return data ? (
    <>
      <Modal opened={opened} onClose={handler.close} title='Create a new role'></Modal>
      <Tabs grow orientation={isSmall ? 'horizontal' : 'vertical'} variant='pills' styles={({fontSizes: {md}}) => ({
        tabInner: {
          fontSize: md,
          fontWeight: 600
        },
        tabsListWrapper: {
          overflow: 'scroll'
        }
      })}>
        {data.map(role => {
          const isCurrent = user.role.name === role.name;
          const isHigher = role.rolePriority <= user.role.rolePriority && !isCurrent;
          return (
            <Tabs.Tab key={role.name} label={role.name} icon={<Color color={role.color}/>}>
              <Stack style={{ overflow: 'scroll' }}>
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
                <TextInput disabled={isCurrent || isHigher} label='Name' defaultValue={role.name}/>
                <ColorInput disabled={isCurrent || isHigher} label='Color' defaultValue={role.color}/>
                <NumberInput disabled={isCurrent || isHigher} label='Priority' min={user.role.rolePriority + 1}
                  defaultValue={role.rolePriority}/>
                <NumberInput disabled={isCurrent || isHigher} hideControls={false} rightSectionWidth={72} rightSection={
                  <Badge radius='xs' color='dark' mr='xs' fullWidth>{prettyBytes(role.maxFileSize)}</Badge>
                } label='Max file size (in bytes)'
                defaultValue={role.maxFileSize} min={107374182} step={1048576}/>
                <div>
                  <Text size='xs' mb={4}>Permissions</Text>
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
                </div>
                <div>
                  <Text size='xs' mb={4}>Members</Text>
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
