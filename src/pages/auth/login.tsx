import {
  ActionIcon,
  Affix,
  Avatar,
  Badge,
  Button, Checkbox,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Tooltip,
  Transition,
  useMantineColorScheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {SiDiscord} from 'react-icons/si';
import Container from 'components/Container';
import {FiEdit, FiLock, FiLogIn, FiUser} from 'react-icons/fi';
import React, {useEffect, useState} from 'react';
import {RiCheckFill, RiErrorWarningFill, RiKeyFill, RiMoonClearFill, RiSunFill} from 'react-icons/ri';
import {getProviders, signIn, useSession} from 'next-auth/react';
import router from 'next/router';
import {showNotification, useNotifications} from '@mantine/notifications';

export default function LoginPage({ providers }) {
  const { data: session } = useSession();
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (session) router.push('/dash');
    setMount(true);
  }, [router]);
  const providersStyle = {
    'discord': {
      icon: <SiDiscord />,
      color: '#7289DA'
    }
  };
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      rememberMe: true
    }
  });
  const authProviders = Object.values(providers);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Paper component='body' style={{ height: '100vh' }}>
      <Transition transition='slide-right' duration={600} mounted={mount}>
        {styles => (
          <Container style={{ width: '375px', ...styles }}>
            {authProviders.length === 0 ? <Title order={5} align='center'>No available provider to login.</Title> :
              authProviders.find((x: { id }) => x.id === 'credentials') && (
                <form onSubmit={form.onSubmit(async values => {
                  const res = await signIn('credentials', { username: values.username, password: values.password, callbackUrl: '/dash', redirect: false, rememberMe: values.rememberMe });
                  if (res.error) {
                    if (res.error === 'CredentialsSignin')
                      return showNotification({
                        title: 'Username not found or wrong password',
                        color: 'red',
                        icon: <RiKeyFill/>,
                        message: ''
                      });
                    else return showNotification({ title: 'Failed to sign in', color: 'red', icon: <RiErrorWarningFill/>, message: res.error });
                  }
                  else {
                    showNotification({ title: 'Login successfully, redirecting to Dashboard', message: '', icon: <RiCheckFill/>, color: 'green' });
                    router.push('/dash');
                  }
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
                  <Checkbox mt='md' label='Remember me' {...form.getInputProps('rememberMe', { type: 'checkbox' })}/>
                  <Group position='apart' mt='md'>
                    <Group spacing={4}>
                      {authProviders.filter((x: { id }) => x.id !== 'credentials').map((x: { id, name }, i) => (
                        <Tooltip key={i} label={`Login with ${x.name}`}>
                          <ActionIcon size='lg' onClick={() => signIn(x.id, { callbackUrl: '/dash' })}
                            style={{ background: providersStyle[x.id] && providersStyle[x.id].color }} variant='filled'>
                            {providersStyle[x.id] ? providersStyle[x.id].icon : <FiLock />}
                          </ActionIcon>
                        </Tooltip>
                      ))}
                    </Group>
                    <div>
                      <Button leftIcon={<FiEdit />} variant='subtle'>Register</Button>
                      <Button ml={4} leftIcon={<FiLogIn />} type='submit'>Login</Button>
                    </div>
                  </Group>
                </form>
              )}
          </Container>
        )}
      </Transition>
      <Affix position={{ bottom: '2%', right: '2% ' }}>
        <Badge leftSection={
          <Avatar size={16} mx={0} src='/logo.png' />
        } rightSection={
          <ActionIcon variant='transparent' mx='-sm' onClick={() => toggleColorScheme()} size='lg'>
            {colorScheme === 'dark' ? <RiSunFill /> : <RiMoonClearFill />}
          </ActionIcon>
        }>{process.env.NEXT_PUBLIC_VOID_VERSION}</Badge>
      </Affix>
    </Paper>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}

LoginPage.title = 'Login';
