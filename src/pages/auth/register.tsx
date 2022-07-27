import {ActionIcon, Button, Divider, Stack, Text, TextInput} from '@mantine/core';
import {useForm, yupResolver} from '@mantine/form';
import {NextLink} from '@mantine/next';
import {showNotification} from '@mantine/notifications';
import Container from 'components/Container';
import PasswordBox from 'components/PasswordBox';
import {Tooltip} from '@mantine/core';
import useSession from 'lib/hooks/useSession';
import {request} from 'lib/utils';
import {useRouter} from 'next/router';
import {useState} from 'react';
import {FiChevronLeft, FiLock, FiMail, FiSend, FiStar, FiUser} from 'react-icons/fi';
import {RiCheckFill, RiErrorWarningFill} from 'react-icons/ri';
import {object as yupObject, string as yupString} from 'yup';

export default function RegisterPage() {
  const router = useRouter();
  useSession(false, null, () => router.push('/dash'));
  const [busy, setBusy] = useState(false);
  const schema = yupObject({
    referral: yupString().required().min(25, 'Invalid referral code.'),
    email: yupString().email().required(),
    username: yupString().required().matches(/^(\S+)([A-Za-z_]\w*)$/ug, 'Username must be alphanumeric.').min(3, {message: 'Username should be longer than 3 characters.'}),
    password: yupString().required().matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{6,}$/g, 'Password must match shown criteria.'),
  });
  const form = useForm({
    initialValues: {
      referral: router.query.code || '',
      email: '',
      username: '',
      password: ''
    },
    validate: yupResolver(schema)
  });
  return (
    <Container style={{ minWidth: 500, position: 'relative' }}>
      <Tooltip label='Back to Login'>
        <ActionIcon style={{ position: 'absolute', left: 16, top: 16 }} component={NextLink} href='/auth/login'>
          <FiChevronLeft/>
        </ActionIcon>
      </Tooltip>
      <Text size='xl' align='center' weight={700}>Apply to the
        <Tooltip label={process.env.voidVersion}>
          <Text size='xl' ml={4} variant='gradient' gradient={{ from: '#D1C4E9', to: '#5E35B1', deg: 150 }} weight={700} component='span'>Void</Text>
        </Tooltip>
      </Text>
      <Divider mx={196} my='xs'/>
      <form style={{ minWidth: 360 }} onSubmit={form.onSubmit(values =>
        request({
          onStart: () => setBusy(true),
          endpoint: '/api/auth/register',
          method: 'POST',
          body: values,
          callback({ ref }) {
            showNotification({ title: 'Registered successfully, redirecting to the login page.', message: `Referred by ${ref}`, icon: <RiCheckFill/>, color: 'green' });
            router.push('/auth/login');
          },
          onError: e =>
            showNotification({ title: 'Failed to register', color: 'red', icon: <RiErrorWarningFill/>, message: e }),
          onDone: () => setBusy(false)
        }))}>
        <Stack>
          <TextInput
            required
            icon={<FiStar />}
            autoComplete='off'
            label='Referral code'
            {...form.getInputProps('referral')}
          />
          <TextInput
            required
            icon={<FiMail />}
            type='email'
            label='Email'
            {...form.getInputProps('email')}
          />
          <TextInput
            required
            icon={<FiUser />}
            label='Username'
            {...form.getInputProps('username')}
          />
          <PasswordBox
            required
            style={{ width: '100%' }}
            autoComplete='new-password'
            icon={<FiLock />}
            label='Password'
            {...form.getInputProps('password')}>
          </PasswordBox>
          <Button mt='md' loading={busy} fullWidth leftIcon={<FiSend />} type='submit'>Register</Button>
        </Stack>
      </form>
    </Container>
  );
}

RegisterPage.title = 'Register';
