import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Checkbox,
  Group,
  Image,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Tooltip,
  Transition,
  useMantineColorScheme
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {showNotification} from '@mantine/notifications';
import Container from 'components/Container';
import {getProviders, signIn, useSession} from 'next-auth/react';
import router from 'next/router';
import React, {useEffect, useState} from 'react';
import {FiLock, FiLogIn, FiUser} from 'react-icons/fi';
import {RiCheckFill, RiErrorWarningFill, RiKeyFill, RiMoonClearFill, RiSunFill} from 'react-icons/ri';
import {SiDiscord, SiGithub} from 'react-icons/si';

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
    },
    'github': {
      icon: <SiGithub />,
      color: 'black'
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
    <Paper style={{ height: '100vh' }}>
      <Transition transition='slide-right' duration={600} mounted={mount}>
        {styles => (
          <Container style={{ backgroundSize: 'cover', ...styles }}>
            <Group align='center' spacing='lg' position='apart'>
              {authProviders.length === 0 ? <Title order={5} align='center'>No available provider to login.</Title> :
                authProviders.find((x: { id }) => x.id === 'credentials') && (
                  <form style={{ minWidth: 360 }} onSubmit={form.onSubmit(async values => {
                    const res = await signIn('credentials', { username: values.username, password: values.password, callbackUrl: '/dash', redirect: false, rememberMe: values.rememberMe });
                    if (res.error) {
                      if (res.error === 'CredentialsSignin')
                        return showNotification({
                          title: 'Wrong password!',
                          color: 'red',
                          icon: <RiKeyFill/>,
                          message: ''
                        });
                      else return showNotification({ title: 'Failed to sign in', color: 'red', icon: <RiErrorWarningFill/>, message: res.error });
                    }
                    else {
                      showNotification({ title: 'Logged in successfully, redirecting to the Dashboard.', message: '', icon: <RiCheckFill/>, color: 'green' });
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
                    {/*<Button leftIcon={<FiEdit />} variant='subtle'>Register</Button>*/}
                    <div style={{ display: 'flex', marginTop: 16 }}>
                      <Group spacing={4} mr={4}>
                        {authProviders.filter((x: { type }) => x.type === 'oauth').map((x: { id, name }) => (
                          <Tooltip key={x.id} label={`Login with ${x.name}`}>
                            <ActionIcon size='lg' onClick={() => signIn(x.id, { callbackUrl: '/dash' })}
                              style={{ background: providersStyle[x.id] && providersStyle[x.id].color }} variant='filled'>
                              {providersStyle[x.id] ? providersStyle[x.id].icon : <FiLock />}
                            </ActionIcon>
                          </Tooltip>
                        ))}
                      </Group>
                      <Button style={{ flex: 1 }} leftIcon={<FiLogIn />} type='submit'>Login</Button>
                    </div>
                  </form>
                )}
            </Group>
          </Container>
        )}
      </Transition>
      <Affix position={{ bottom: '2%', right: '2% ' }}>
        <Badge leftSection={
          <Image width={16} height={16} mx={0} alt='Logo' src='/logo.png' />
        } rightSection={
          <ActionIcon variant='transparent' mx='-sm' onClick={() => toggleColorScheme()} size='lg'>
            {colorScheme === 'dark' ? <RiSunFill /> : <RiMoonClearFill />}
          </ActionIcon>
        }>{process.env.voidVersion}</Badge>
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
