import {Anchor, Button, Group, Modal, PasswordInput, Select, Stack, TextInput} from '@mantine/core';
import {useForm, yupResolver} from '@mantine/form';
import {showNotification} from '@mantine/notifications';
import {hasPermission, Permission} from 'lib/permission';
import {useSession} from 'next-auth/react';
import React, {useEffect, useState} from 'react';
import {FiScissors} from 'react-icons/fi';
import {RiClipboardFill, RiErrorWarningFill} from 'react-icons/ri';
import * as yup from 'yup';

export default function Dialog_Shorten({ onClose, opened, onShorten, ...props }) {
  const schema = yup.object({
    Destination: yup.string().required().url(),
    URL: yup.string().oneOf(['alphanumeric', 'emoji', 'invisible'], 'Invalid URL type.').default('alphanumeric'),
    Vanity: yup.string().nullable().min(4),
    Password: yup.string().nullable()
  });
  const form = useForm({
    schema: yupResolver(schema),
    initialValues: {
      Destination: '',
      URL: 'alphanumeric',
      Vanity: '',
      Password: ''
    }
  });
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
    <Modal size={600} opened={opened} overlayBlur={4} onClose={onClose} {...props} title='Shorten URLs'>
      <form onSubmit={form.onSubmit(shorten)}>
        <Stack>
          <TextInput required placeholder='Paste your long URL here' {...form.getInputProps('Destination')}/>
          <Group grow>
            <Select label='URL' required disabled={form.values.Vanity.length > 0} data={['alphanumeric', 'emoji', 'invisible']} {...form.getInputProps('URL')}/>
            {canUseVanity && <TextInput label='Vanity URL' placeholder='Leave blank for random URL' {...form.getInputProps('Vanity')}/>}
          </Group>
          <PasswordInput autoComplete='one-time-code' label='Password' placeholder='Leave blank for none' {...form.getInputProps('Password')}/>
          <Button type='submit' leftIcon={<FiScissors/>}>Shorten</Button>
        </Stack>
      </form>
    </Modal>
  );
}
