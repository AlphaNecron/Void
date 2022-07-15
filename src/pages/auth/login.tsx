import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Transition,
  useMantineColorScheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {showNotification} from '@mantine/notifications';
import Container from 'components/Container';
import useSession from 'lib/hooks/useSession';
import router from 'next/router';
import {useEffect, useState} from 'react';
import {FiLock, FiLogIn, FiUser} from 'react-icons/fi';
import {RiCheckFill, RiErrorWarningFill, RiMoonClearFill, RiSunFill} from 'react-icons/ri';
import {SiDiscord} from 'react-icons/si';

export default function LoginPage() {
  const [mount, setMount] = useState(false);
  const [busy, setBusy] = useState(false);
  const { revalidate } = useSession();
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
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Paper style={{ height: '100vh' }}>
      <Transition transition='slide-right' duration={600} mounted={mount}>
        {styles => (
          <Container style={{ backgroundSize: 'cover', ...styles }}>
            <Text size='xl' weight={700} align='center'>Enter the
              <Text size='xl' ml={4} variant='gradient' gradient={{ from: '#D1C4E9', to: '#5E35B1', deg: 180 }} weight={700} component='span'>Void</Text>
            </Text>
            <Divider mx={128} my='sm'/>
            <Group align='center' spacing='lg' position='apart'>
              <form style={{ minWidth: 360 }} onSubmit={form.onSubmit(values => {
                setBusy(true);
                fetch('/api/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(values)
                }).then(r => r.json()).then(r => {
                  if (r.success) {
                    showNotification({ title: 'Logged in successfully, redirecting to the Dashboard.', message: '', icon: <RiCheckFill/>, color: 'green' });
                    revalidate(() => router.push('/dash'));
                  }
                  else
                    showNotification({ title: 'Failed to sign in.', color: 'red', icon: <RiErrorWarningFill/>, message: r.error });
                }).finally(() => setBusy(false));
              })}>
                <TextInput
                  required
                  icon={<FiUser />}
                  label='Username'
                  {...form.getInputProps('username')}
                />
                <PasswordInput
                  required
                  icon={<FiLock />}
                  label='Password'
                  {...form.getInputProps('password')}>
                </PasswordInput>
                <Button loading={busy} fullWidth leftIcon={<FiLogIn />} mt='xs' type='submit'>Login with credentials</Button>
                <Divider my='xs' mx={128}/>
                <Button loading={busy} fullWidth style={{ backgroundColor: '#7289DA' }} onClick={() =>
                  fetch('/api/discord/auth').then(r => r.json()).then(r => {
                    router.push(r.url);
                  })} leftIcon={<SiDiscord/>}>Login with Discord</Button>
              </form>
            </Group>
          </Container>
        )}
      </Transition>
      <Affix position={{ bottom: '2%', right: '2% ' }}>
        <Badge variant='filled' radius='xs' size='md' px='xs'>
          <Group spacing={0}>
            <Text ml='xs' style={{ fontSize: 10 }}>
              {process.env.voidVersion}
            </Text>
            <ActionIcon variant='transparent' style={{ color: 'white' }} onClick={() => toggleColorScheme()}>
              {colorScheme === 'dark' ? <RiSunFill /> : <RiMoonClearFill />}
            </ActionIcon>
          </Group>
        </Badge>
      </Affix>
    </Paper>
  );
}

LoginPage.title = 'Login';
