import {
  ActionIcon,
  Affix,
  Avatar,
  Button,
  Checkbox,
  ColorInput,
  Container,
  CSSObject,
  Divider,
  Group,
  Highlight,
  Image,
  MantineTheme,
  Popover,
  Select,
  Stack,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useClipboard, useDisclosure, useSetState} from '@mantine/hooks';
import {showNotification} from '@mantine/notifications';
import {Prism} from '@mantine/prism';
import CustomTabs from 'components/CustomTabs';
import Layout from 'components/Layout';
import PasswordBox from 'components/PasswordBox';
import ShareXIcon from 'components/ShareXIcon';
import {signOut, useSession} from 'next-auth/react';
import React, {useState} from 'react';
import {FaUserCircle} from 'react-icons/fa';
import {FiDownload, FiInfo, FiLogOut, FiSave, FiScissors} from 'react-icons/fi';
import {IoCopyOutline, IoEyeOffOutline, IoEyeOutline, IoRefreshOutline} from 'react-icons/io5';
import {RiBracesFill, RiClipboardFill, RiKey2Fill, RiKeyLine} from 'react-icons/ri';
import useSWR from 'swr';

export default function Page_Account() {
  const [reveal, setReveal] = useState(false);
  const clipboard = useClipboard({ timeout: 500 });
  const [open, handler] = useDisclosure(false);
  const { data: { user }} = useSession();
  const [ shareXOptions, setShareXOptions ] = useSetState({ name: 'Void', url: 'alphanumeric', askPassword: false });
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
    } catch {
      return false;
    }
    return true;
  };
  const form = useForm({
    initialValues: {
      name: '',
      username: '',
      password: '',
      embedEnabled: false,
      embedColor: '',
      embedSiteName: '',
      embedSiteNameUrl: '',
      embedTitle: '',
      embedDescription: '',
      embedAuthor: '',
      embedAuthorUrl: ''
    },
    validate: {
      embedSiteNameUrl: (value) => (value || '').length === 0 ? null : validateUrl(value) ? null : 'Malformed URL',
      embedAuthorUrl: (value) => (value || '').length === 0 ? null : validateUrl(value) ? null : 'Malformed URL'
    }
  });
  const { data: dataToken, mutate: mutateToken } = useSWR('/api/user/token', (url: string) => fetch(url).then(r => r.json()));
  const { data, mutate } = useSWR('/api/user', (url: string) => fetch(url).then(r => r.json()).then(r => {
    form.setValues(r);
    return r;
  }), {
    revalidateOnMount: true,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const regenToken = () => {
    fetch('/api/user/token', {
      method: 'PATCH',
    })
      .then(r => r.json())
      .then(t => { if (t.newToken) { showNotification({ title: 'Successfully regenerated your private token.', message: '', color: 'green', icon: <RiKey2Fill/>}); mutateToken(); }});
  };
  const variables = {
    'id': 'File\'s unique identifier',
    'size': 'File size',
    'filename': 'The file name when uploaded',
    'mimetype': 'Mimetype of the file',
    'date': 'The date the file is uploaded',
    'time': 'The time the file is uploaded',
    'datetime': 'The date and time the file is uploaded',
    'username': 'Name of user uploaded the file'
  };
  const hlStyle = (theme: MantineTheme): CSSObject => ({
    background: theme.colors[theme.primaryColor][7],
    fontWeight: 'bold',
    color: theme.white,
    padding: '2px 4px',
    boxShadow: theme.shadows.md,
    borderRadius: theme.radius.sm
  });
  const updateUser = values =>
    fetch('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(r => r.json()).then(r => {
      if (!r.error) mutate();
    });
  const uploaderConfig = {
    Version: '13.2.1',
    Name: shareXOptions.name,
    DestinationType: 'ImageUploader, FileUploader, TextUploader',
    RequestMethod: 'POST',
    RequestURL: `${window.location.origin}/api/upload`,
    Headers: {
      Authorization: dataToken?.privateToken,
      URL: shareXOptions.url
    },
    URL: '$json:[0].url$',
    ThumbnailURL: '$json:thumbUrl$',
    DeletionURL: '$json:deletionUrl$',
    ErrorMessage: '$json:error$',
    Body: 'MultipartFormData',
    FileFormName: 'files'
  };
  const shortenerConfig = {
    Version: '13.2.1',
    Name: shareXOptions.name,
    DestinationType: 'URLShortener, URLSharingService',
    RequestMethod: 'POST',
    RequestURL: `${window.location.origin}/api/shorten`,
    Headers: {
      Authorization: dataToken?.privateToken
    },
    Body: 'FormURLEncoded',
    Arguments: {
      Destination: '$input$',
      URL: shareXOptions.url,
      ...(shareXOptions.askPassword && { Password: '$prompt:Password$' })
    },
    URL: '$json:url$',
    ErrorMessage: '$json:error$'
  };
  return (
    <Layout id={9} onReload={mutate}>
      {data && (
        <form onSubmit={form.onSubmit(updateUser)}>
          <CustomTabs initialTab={0} position='center'>
            <Tabs.Tab label='Info' icon={<FaUserCircle/>}>
              <Title order={3}>Basic information</Title>
              <Divider mb='md'/>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar mr='xl' ml='xs' size={160} radius={100} src={user?.image}/>
                <Stack style={{ flex: 1 }}>
                  <Group grow>
                    <TextInput label='Display name' description='Can be your real name or whatever you like' placeholder='Display name' {...form.getInputProps('name')}/>
                    <TextInput required label='Username' description='The unique username used to login to your account' placeholder='Username' {...form.getInputProps('username')}/>
                  </Group>
                  <PasswordBox
                    label='Password'
                    autoComplete='new-password'
                    placeholder='New password'
                    description='Strong password should include letters in lower and uppercase, at least 1 number, at least 1 special symbol'
                    {...form.getInputProps('password')}/>
                </Stack>
              </div>
              {dataToken && (
                <TextInput color='red' mt='md' value={dataToken.privateToken} type={reveal ? 'text' : 'password'} label='Token' description='Remember to keep it safe or people can upload on behalf of you' placeholder='Click Regenerate button to generate one.' rightSectionWidth={96} rightSection={
                  <>
                    <Tooltip label={reveal ? 'Hide' : 'Show'}>
                      <ActionIcon onClick={() => setReveal(!reveal)}>
                        {reveal ? <IoEyeOffOutline/> : <IoEyeOutline/>}
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label='Copy'>
                      <ActionIcon onClick={() => {
                        clipboard.copy(dataToken.privateToken);
                        showNotification({
                          title: 'Copied the private token to your clipboard.',
                          message: 'Remember to keep it secret as other people can use the token to upload or shorten without your permission.',
                          color: 'yellow', icon: <RiClipboardFill/>
                        });
                      }}>
                        <IoCopyOutline/>
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label='Regenerate'>
                      <ActionIcon onClick={regenToken}>
                        <IoRefreshOutline/>
                      </ActionIcon>
                    </Tooltip>
                  </>
                } readOnly icon={<RiKeyLine/>} autoComplete='one-time-code'/>
              )}
            </Tabs.Tab>
            <Tabs.Tab label='Embed' icon={<RiBracesFill/>}>
              <Group align='center'>
                <Title order={3}>Embed</Title>
                <Popover opened={open} onClose={handler.close} position='right' transition='skew-down' target={
                  <ActionIcon onClick={handler.toggle} variant='hover' color='blue'>
                    <FiInfo/>
                  </ActionIcon>
                }>
                  <Table>
                    <caption>
                        Embed variables
                    </caption>
                    <tbody>
                      {Object.entries(variables).map(([x, y], i) => (
                        <tr key={i}>
                          <td>{`{{${x}}}`}</td>
                          <td>{y}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Popover>
              </Group>
              <Divider mb='md'/>
              <Group grow align='start'>
                <Stack>
                  <Checkbox label='Enable embed' {...form.getInputProps('embedEnabled', { type: 'checkbox' })}/>
                  <ColorInput style={{ flex: 1 }} required label='Color' placeholder='Embed color' {...form.getInputProps('embedColor')}/>
                  <TextInput maxLength={32} required label='Site name' placeholder='Embed site name' {...form.getInputProps('embedSiteName')}/>
                  <TextInput maxLength={32} label='Site name URL' placeholder='Embed site name URL' {...form.getInputProps('embedSiteNameUrl')}/>
                  <TextInput maxLength={32} label='Title' placeholder='Embed title' {...form.getInputProps('embedTitle')}/>
                  <Textarea label='Description' maxLength={72} placeholder='Embed description' {...form.getInputProps('embedDescription')}/>
                  <TextInput maxLength={32} label='Author' placeholder='Author' {...form.getInputProps('embedAuthor')}/>
                  <TextInput label='Author URL' placeholder='Author URL' {...form.getInputProps('embedAuthorUrl')}/>
                </Stack>
                <Container py={4} ml='md' mt='xl' px={10} style={{ borderLeft: `3px solid ${form.values.embedColor}`, borderRadius: 4, background: '#2F3136', width: 480, maxHeight: 360 }} mb='md'>
                  <Highlight target='_blank' style={{ fontSize: 12 }} color='dimmed' highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} component='a' variant='link' href={form.values.embedSiteNameUrl}>{form.values.embedSiteName || 'Site name'}</Highlight>
                  <Highlight target='_blank' highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} component='a' variant='link' style={{ fontSize: 14, display: 'block', color: 'white' }} href={form.values.embedAuthorUrl}>{form.values.embedAuthor || 'Author'}</Highlight>
                  <Highlight target='_blank' component='a' href='/random' variant='link' highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} weight={600} color='blue' style={{ fontSize: 16 }}>{form.values.embedTitle || 'Title'}</Highlight>
                  <Highlight style={{ wordWrap: 'break-word', color: '#bbb' }} highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} size='sm' color='white'>{form.values.embedDescription || 'Description'}</Highlight>
                  <Image fit='contain' height={225} src='/banner.png' alt='Preview image'/>
                </Container>
              </Group>
            </Tabs.Tab>
            <Tabs.Tab label='ShareX' icon={<ShareXIcon size={16}/>}>
              <Title order={3}>ShareX config builder</Title>
              <Divider mb='md'/>
              <Group direction='row' grow align='start'>
                <Stack spacing={4}>
                  <TextInput label='Config name' value={shareXOptions.name} onChange={e => setShareXOptions({ name: e.target.value })}/>
                  <Select label='URL' data={['alphanumeric', 'emoji', 'invisible']} value={shareXOptions.url} onChange={url => setShareXOptions({ url })}/>
                  <Checkbox label='Ask password when shortening?' mt='xs' checked={shareXOptions.askPassword} onChange={e => setShareXOptions({ askPassword: e.target.checked })}/>
                  <Group mt='md'>
                    <Button leftIcon={<FiDownload/>} variant='gradient' gradient={{ from: 'yellow', to: 'red' }} download='Void_Uploader.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(uploaderConfig,null,'\t')],{type:'application/json'}))} component='a'>Uploader</Button>
                    <Button leftIcon={<FiDownload/>} variant='gradient' gradient={{ from: 'blue', to: 'green' }} download='Void_Shortener.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(shortenerConfig,null,'\t')],{type:'application/json'}))} component='a'>Shortener</Button>
                  </Group>
                </Stack>
                <Prism.Tabs>
                  <Prism.Tab withLineNumbers icon={<FiDownload/>} language='json' noCopy label='Void_Uploader.sxcu'>
                    {JSON.stringify({...uploaderConfig, Headers: { ...uploaderConfig.Headers, Authorization: '<MASKED>' }}, null, '\t')}
                  </Prism.Tab>
                  <Prism.Tab withLineNumbers icon={<FiScissors/>} language='json' noCopy label='Void_Shortener.sxcu'>
                    {JSON.stringify({...shortenerConfig, Headers: { ...shortenerConfig.Headers, Authorization: '<MASKED>'}}, null, '\t')}
                  </Prism.Tab>
                </Prism.Tabs>
              </Group>
            </Tabs.Tab>
          </CustomTabs>
          <Affix position={{ bottom: 16, right: 16 }}>
            <Group spacing={4}>
              <Button leftIcon={<FiLogOut/>} color='red' onClick={() => signOut({ callbackUrl: '/auth/login' })}>Logout</Button>
              <Button type='submit' color='green' leftIcon={<FiSave/>}>Save</Button>
            </Group>
          </Affix>
        </form>
      )}
    </Layout>
  );
}

Page_Account.title = 'Account';
Page_Account.authRequired = true;
