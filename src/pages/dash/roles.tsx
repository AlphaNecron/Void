import {Alert, Button, ColorInput, Divider, LoadingOverlay, Stack, Tabs, Text, TextInput} from '@mantine/core';
import List from 'components/List';
import useFetch from 'lib/hooks/useFetch';
import useSession from 'lib/hooks/useSession';
import {validateHex} from 'lib/utils';
import {FiPlus} from 'react-icons/fi';
import {RiAlertFill} from 'react-icons/ri';

function Color({color}) {
  return <div style={{background: validateHex(color) ? color : 'white', width: 16, height: 16, borderRadius: '100%'}}/>;
}

export default function Page_Roles() {
  const {user} = useSession();
  const {data, mutate} = useFetch('/api/admin/roles');
  return data ? (
    <>
      <Button style={{ width: 160 }} variant='outline' leftIcon={<FiPlus/>}>Create</Button>
      <Divider my='xs' style={{ width: 120 }} mx={20}/>
      <Tabs orientation='vertical' variant='pills' styles={({fontSizes: {md}}) => ({
        tabInner: {
          margin: '0 16px',
          fontSize: md,
          fontWeight: 600
        },
        tabsList: {
          width: 160
        },
        body: {
          marginTop: -56
        }
      })}>
        {data.map(role => {
          const isCurrent = user.role.name === role.name;
          const isHigher = role.rolePriority <= user.role.rolePriority && !isCurrent;
          return (
            <Tabs.Tab key={role.name} label={role.name} icon={<Color color={role.color}/>}>
              <Stack>
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
    </>
  ) : <LoadingOverlay visible/>;
}

Page_Roles.title = 'Roles';
Page_Roles.adminOnly = true;
