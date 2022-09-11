import {Anchor, Button, Group, Modal, PasswordInput, Select, Stack, TextInput} from '@mantine/core';
import {useForm, yupResolver} from '@mantine/form';
import {useClipboard} from '@mantine/hooks';
import useRequest from 'lib/hooks/useRequest';
import useSession from 'lib/hooks/useSession';
import {showError, showSuccess} from 'lib/notification';
import {hasPermission, Permission} from 'lib/permission';
import {useEffect, useState} from 'react';
import {FiScissors} from 'react-icons/fi';
import {RiClipboardFill, RiErrorWarningFill} from 'react-icons/ri';
import {object as yupObject, string as yupString} from 'yup';

export default function Dialog_Shorten({onClose, opened, onShorten, ...props}) {
  const schema = yupObject({
    Destination: yupString().required().url(),
    URL: yupString().oneOf(['alphanumeric', 'emoji', 'invisible'], 'Invalid URL type.').default('alphanumeric'),
    Vanity: yupString().nullable(),
    Password: yupString().nullable()
  });
  const form = useForm({
    validate: yupResolver(schema),
    initialValues: {
      Destination: '',
      URL: 'alphanumeric',
      Vanity: '',
      Password: ''
    }
  });
  const [canUseVanity, setCanUseVanity] = useState(false);
  const {request} = useRequest();
  const session = useSession(true);
  const clip = useClipboard();
  useEffect(() =>
    setCanUseVanity(hasPermission(session.user?.role.permissions, Permission.VANITY)), [session]);
  const shorten = values =>
    request({
      endpoint: '/api/shorten',
      method: 'POST',
      body: values,
      callback(u) {
        if (u.url) {
          clip.copy(u.url);
          onShorten();
          return showSuccess('Copied the URL to your clipboard.', <RiClipboardFill/>, <Anchor target='_blank'
            href={u.url}>{u.url}</Anchor>);
        }
      },
      onError: e => showError('Failed to shorten the URL.', <RiErrorWarningFill/>, e)
    });
  return (
    <Modal size={600} opened={opened} onClose={onClose} {...props} title='Shorten URLs'>
      <form onSubmit={form.onSubmit(shorten)}>
        <Stack>
          <TextInput required placeholder='Paste your long URL here' {...form.getInputProps('Destination')}/>
          <Group grow>
            <Select label='URL' required disabled={form.values.Vanity.length > 0}
              data={['alphanumeric', 'emoji', 'invisible']} {...form.getInputProps('URL')}/>
            {canUseVanity && <TextInput label='Vanity URL'
              placeholder='Leave blank for random URL' {...form.getInputProps('Vanity')}/>}
          </Group>
          <PasswordInput autoComplete='one-time-code' label='Password'
            placeholder='Leave blank for none' {...form.getInputProps('Password')}/>
          <Button type='submit' leftIcon={<FiScissors/>}>Shorten</Button>
        </Stack>
      </form>
    </Modal>
  );
}
