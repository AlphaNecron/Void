import {
  ActionIcon,
  Button,
  Divider,
  Group,
  PasswordInput,
  Text,
  TextInput, Tooltip,
  Transition,
  useMantineColorScheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {NextLink} from '@mantine/next';
import {showNotification} from '@mantine/notifications';
import Container from 'components/Container';
import useSession from 'lib/hooks/useSession';
import {request} from 'lib/utils';
import router from 'next/router';
import {useEffect, useState} from 'react';
import {FiEdit, FiLock, FiLogIn, FiMoon, FiSun, FiUser} from 'react-icons/fi';
import {RiCheckFill, RiErrorWarningFill} from 'react-icons/ri';
import {SiDiscord} from 'react-icons/si';

export default function LoginPage() {
  const [mount, setMount] = useState(false);
  const [busy, setBusy] = useState(false);
  const {revalidate} = useSession(false, null, () => router.push('/dash'));
  useEffect(() => {
    setMount(true);
    return () => setMount(false);
  }, []);
  const form = useForm({
    initialValues: {
      username: '',
      password: ''
    }
  });
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Transition transition='slide-right' duration={600} mounted={mount}>
      {styles => (
        <Container style={styles}>
          <Group position='apart' mb='xl'>
            <Text size='xl' weight={700}>Enter the
              <Tooltip label={process.env.voidVersion}>
                <Text size='xl' ml={4} variant='gradient' gradient={{from: '#D1C4E9', to: '#5E35B1', deg: 150}}
                  weight={700} component='span'>Void</Text>
              </Tooltip>
            </Text>
            <Tooltip label={`Use ${isDark ? 'light' : 'dark'} theme`}>
              <ActionIcon color={isDark ? 'orange' : 'void'} onClick={() => toggleColorScheme()}>
                {isDark ? <FiSun/> : <FiMoon/>}
              </ActionIcon>
            </Tooltip>
          </Group>
          <form style={{minWidth: 360}} onSubmit={form.onSubmit(values =>
            request({
              onStart: () => setBusy(true),
              endpoint: '/api/auth/login',
              method: 'POST',
              body: values,
              callback() {
                showNotification({
                  title: 'Logged in successfully, redirecting to the Dashboard.',
                  message: '',
                  icon: <RiCheckFill/>,
                  color: 'green'
                });
                revalidate(() => router.push('/dash'));
              },
              onError: e =>
                showNotification({
                  title: 'Failed to sign in.',
                  color: 'red',
                  icon: <RiErrorWarningFill/>,
                  message: e
                }),
              onDone: () => setBusy(false)
            }))}>
            <TextInput
              required
              icon={<FiUser/>}
              label='Username'
              {...form.getInputProps('username')}
            />
            <PasswordInput
              my='xs'
              required
              icon={<FiLock/>}
              label='Password'
              {...form.getInputProps('password')}>
            </PasswordInput>
            <Button mt='lg' fullWidth loading={busy} style={{flex: 1}} leftIcon={<FiLogIn/>} type='submit'>Login</Button>
            <Divider my='xs' mx={128}/>
            <Group grow>
              <Button color='violet' leftIcon={<FiEdit/>} component={NextLink} href='/auth/register'>Register now</Button>
              <Button loading={busy} fullWidth style={{backgroundColor: '#7289DA'}} onClick={() =>
                fetch('/api/discord/auth').then(r => r.json()).then(r => {
                  router.push(r.url);
                })} leftIcon={<SiDiscord/>}>Login with Discord</Button>
            </Group>
          </form>
        </Container>
      )}
    </Transition>
  );
}

LoginPage.title = 'Login';
