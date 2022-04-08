import React, {useEffect, useState} from 'react';
import Layout from 'components/Layout';
import {hasPermission, Permission} from 'lib/permission';
import Container from 'components/Container';
import {ActionIcon, Anchor, Button, Group, Menu, PasswordInput, Select, Stack, TextInput, Tooltip} from '@mantine/core';
import {FiScissors} from 'react-icons/fi';
import {useForm} from '@mantine/form';
import {GoSettings} from 'react-icons/go';
import {useSession} from 'next-auth/react';
import {showNotification, useNotifications} from '@mantine/notifications';
import {RiClipboardFill, RiErrorWarningFill} from 'react-icons/ri';
import {validateURL} from 'next/dist/server/web/utils';

export default function Page_Shorten() {
  const form = useForm({
    initialValues: {
      Destination: '',
      URL: 'alphanumeric',
      Vanity: '',
      Password: ''
    },
    validate: {
      Destination: (value: string) => validateUrl(value) ? null : 'Malformed URL'
    }
  });
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
    } catch {
      return false;
    }
    return true;
  };
  const [canUseVanity, setCanUseVanity] = useState(false);
  const { data } = useSession({ required: true });
  useEffect(() =>
    setCanUseVanity(hasPermission(data.user.permissions, Permission.VANITY)), [data]);
  const shorten = values => {
    fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(r => r.json()).then(u => {
      if (u.url)
        return showNotification({ title: 'Copied the URL to your clipboard', icon: <RiClipboardFill/>, color: 'green', message: <Anchor target='_blank' href={u.url}>{u.url}</Anchor> });
      showNotification({ title: 'Failed to shorten the URL', icon: <RiErrorWarningFill/>, color: 'red', message: u.error });
    });
  };
  return (
    <Layout id={3}>
      <Container p='xl' style={{ width: '40vw' }}>
        <form onSubmit={form.onSubmit(shorten)}>
          <Stack>
            <TextInput required size='lg' placeholder='Paste your long URL here' {...form.getInputProps('Destination')}/>
            <Group grow>
              <Select label='URL' required disabled={form.values.Vanity.length > 0} data={['alphanumeric', 'emoji', 'invisible']} {...form.getInputProps('URL')}/>
              {canUseVanity && <TextInput label='Vanity URL' placeholder='Leave blank for random URL' {...form.getInputProps('Vanity')}/>}
            </Group>
            <PasswordInput autoComplete='one-time-code' label='Password' placeholder='Leave blank for none' {...form.getInputProps('Password')}/>
            <Button type='submit' leftIcon={<FiScissors/>}>Shorten</Button>
          </Stack>
        </form>
      </Container>
    </Layout>
  );
}

Page_Shorten.authRequired = true;
Page_Shorten.title = 'Shorten';
Page_Shorten.permission = Permission.SHORTEN;
