import type { CSSObject, MantineTheme } from '@mantine/core';
import {
  ActionIcon,
  Affix,
  Avatar,
  Button,
  Checkbox,
  ColorInput,
  Container,
  Group,
  Highlight,
  Image,
  Popover,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  Transition
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import ConfirmButton from 'components/ConfirmButton';
import DashboardCard from 'components/DashboardCard';
import UpdateAvatarDialog from 'components/dialogs/UpdateAvatar';
import PasswordBox from 'components/PasswordBox';
import TextPair from 'components/TextPair';
import UserAvatar from 'components/UserAvatar';
import useFetch from 'lib/hooks/useFetch';
import useRequest from 'lib/hooks/useRequest';
import useSession from 'lib/hooks/useSession';
import { showError, showSuccess, showWarning } from 'lib/notification';
import { userSchema } from 'lib/validate';
import router, { useRouter } from 'next/router';
import { useState } from 'react';
import { FaUserCheck, FaUserCircle } from 'react-icons/fa';
import { FiInfo, FiSave, FiX } from 'react-icons/fi';
import { IoCopyOutline, IoEyeOffOutline, IoEyeOutline, IoRefreshOutline } from 'react-icons/io5';
import { RiBracesFill, RiClipboardFill, RiErrorWarningFill, RiKey2Fill, RiKeyLine } from 'react-icons/ri';
import { SiDiscord } from 'react-icons/si';
import { TbUnlink } from 'react-icons/tb';

export default function Page_Account() {
  const [reveal, setReveal] = useState(false);
  const {isLogged, user, revalidate} = useSession();
  const {reload} = useRouter();
  const {busy, request} = useRequest();
  const {copy} = useClipboard();
  const form = useForm({
    validate: yupResolver(userSchema),
    initialValues: isLogged && {
      ...user, embed: user.embed || {
        enabled: false,
        siteName: 'Void',
        siteNameUrl: '',
        title: '',
        color: '#B794F4',
        description: '',
        author: '',
        authorUrl: ''
      }
    }
  });
  const {
    data: dataToken,
    mutate: mutateToken
  } = useFetch('/api/user/token');
  const {
    data: discordInfo,
    mutate
  } = useFetch('/api/discord');
  const regenToken = () =>
    request({
      endpoint: '/api/user/token',
      method: 'PATCH',
      callback() {
        showSuccess('Successfully regenerated your private token.', <RiKey2Fill />);
        mutateToken();
      }
    });
  const variables = {
    'id': 'File\'s unique identifier',
    'size': 'File size',
    'filename': 'The file name when uploaded',
    'mimetype': 'Mimetype of the file',
    'date': 'The date the file is uploaded',
    'time': 'The time the file is uploaded',
    'datetime': 'The date and time the file is uploaded',
    'username': 'The name of the user uploaded the file (you)'
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
    request({
      endpoint: '/api/user',
      method: 'PATCH',
      body: values,
      callback() {
        showSuccess('Successfully updated your user.', <FaUserCheck />);
        revalidate();
      },
      onError: e => showError('Failed to update your user.', <RiErrorWarningFill />, e)
    });
  const [opened, dHandler] = useDisclosure(false);
  const render = (...pairs: string[][]) => pairs.map(([x, y]) => <TextPair label={x} value={y} key={x} />);
  const deleteAvatar = () => request({
    endpoint: '/api/user/avatar',
    method: 'DELETE',
    onDone: reload
  });
  return (
    <>
      <UpdateAvatarDialog opened={opened} onClose={dHandler.close} onDone={reload} />
      <Stack>
        <form id='account_form' onSubmit={form.onSubmit(updateUser)}>
          <DashboardCard icon={<FaUserCircle />} title='Basic information' mb='md'>
            <div style={{display: 'flex', alignItems: 'center', marginTop: 8}}>
              <Stack align='center' mr='sm'>
                <UserAvatar size={128} mx='sm' user={user} />
                <Group spacing={0}>
                  <Button size='xs' variant='subtle' color='red' onClick={deleteAvatar}>
                    Delete
                  </Button>
                  <Button size='xs' variant='subtle' onClick={dHandler.open}>
                    Update
                  </Button>
                </Group>
              </Stack>
              <div style={{
                display: 'flex',
                columnGap: 16,
                rowGap: 8,
                flex: 1,
                flexFlow: 'wrap',
                justifyContent: 'space-between',
                flexDirection: 'row'
              }}>
                <TextInput style={{flexGrow: 1}} label='Display name'
                  description='Can be your real name or whatever you like'
                  placeholder='Display name' {...form.getInputProps('name')} />
                <TextInput style={{flexGrow: 1}} label='Username'
                  description='The unique username used to login to your account'
                  placeholder='Username' {...form.getInputProps('username')} required />
                <PasswordBox
                  style={{flexBasis: '100%'}}
                  label='Password'
                  autoComplete='new-password'
                  placeholder='New password'
                  description='Strong password should include letters in lower and uppercase, at least 1 number, at least 1 special symbol'
                  {...form.getInputProps('password')} />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard icon={<RiBracesFill />} rightItem={
            <Popover position='right' transition='skew-down'>
              <Popover.Target>
                <ActionIcon variant='subtle' color='blue'>
                  <FiInfo />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
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
              </Popover.Dropdown>
            </Popover>
          } title='Embed'>
            <div style={{display: 'flex', flexWrap: 'wrap-reverse', gap: 16, alignItems: 'center'}}>
              <div style={{
                display: 'flex',
                marginTop: 8,
                flex: '1 1 300px',
                columnGap: 16,
                rowGap: 8,
                flexDirection: 'column'
              }}>
                <Checkbox label='Enable embed' {...form.getInputProps('embed.enabled', {type: 'checkbox'})} />
                <TextInput maxLength={32} label='Site name'
                  placeholder='Embed site name' {...form.getInputProps('embed.siteName')} />
                <TextInput maxLength={32} label='Site name URL'
                  placeholder='Embed site name URL' {...form.getInputProps('embed.siteNameUrl')} />
                <TextInput maxLength={32} label='Title'
                  placeholder='Embed title' {...form.getInputProps('embed.title')} />
                <ColorInput label='Color'
                  placeholder='Embed color' {...form.getInputProps('embed.color')} />
                <TextInput label='Description' maxLength={64}
                  placeholder='Embed description' {...form.getInputProps('embed.description')} />
                <TextInput maxLength={32} label='Author'
                  placeholder='Author' {...form.getInputProps('embed.author')} />
                <TextInput label='Author URL' placeholder='Author URL' {...form.getInputProps('embed.authorUrl')} />
              </div>
              <Transition transition='slide-left' mounted={form.values.enabled}>
                {styles => (
                  <Container py={4} px={10} style={{
                    borderLeft: `3px solid ${form.values.color}`,
                    borderRadius: 4,
                    flex: '1 1 360px',
                    maxHeight: 450,
                    maxWidth: 640,
                    background: '#2F3136',
                    ...styles
                  }}>
                    <Highlight target='_blank' style={{fontSize: 12}} color='dimmed'
                      highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle}
                      component='a'
                      variant='link'
                      href={form.values.siteNameUrl}>{form.values.siteName || 'Site name'}</Highlight>
                    <Highlight target='_blank' highlight={Object.keys(variables).map(x => `{{${x}}}`)}
                      highlightStyles={hlStyle} component='a' variant='link'
                      style={{fontSize: 14, display: 'block', color: 'white'}}
                      href={form.values.authorUrl}>{form.values.author || 'Author'}</Highlight>
                    <Highlight target='_blank' component='a' href='/random' variant='link'
                      highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle}
                      weight={600}
                      color='blue' style={{fontSize: 16}}>{form.values.title || 'Title'}</Highlight>
                    <Highlight style={{wordWrap: 'break-word', color: '#bbb'}}
                      highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle}
                      size='sm'
                      color='white'>{form.values.description || 'Description'}</Highlight>
                    <Image style={{maxHeight: 360, maxWidth: 560}} m='xl' fit='contain' width='100%'
                      src='/banner.png'
                      alt='Preview image' />
                  </Container>
                )}
              </Transition>
            </div>
          </DashboardCard>
        </form>

        {dataToken && (
          <DashboardCard icon={<RiKey2Fill />} title='Private token'>
            <TextInput color='red' mt='md' value={dataToken.privateToken} type={reveal ? 'text' : 'password'}
              description='Remember to keep it safe or people can upload on behalf of you'
              placeholder='Click Regenerate to generate one.' rightSectionWidth={96} rightSection={
                <>
                  <Tooltip label={reveal ? 'Hide' : 'Show'}>
                    <ActionIcon onClick={() => setReveal(!reveal)}>
                      {reveal ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Copy'>
                    <ActionIcon onClick={() => {
                      copy(dataToken.privateToken);
                      showWarning('Copied the private token to your clipboard.',
                        <RiClipboardFill />, 'Remember to keep it secret as other people can use the token to upload or shorten without your permission.');
                    }}>
                      <IoCopyOutline />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Regenerate'>
                    <ActionIcon onClick={regenToken}>
                      <IoRefreshOutline />
                    </ActionIcon>
                  </Tooltip>
                </>
              } readOnly icon={<RiKeyLine />} autoComplete='off' />
          </DashboardCard>
        )}

        <DashboardCard icon={<SiDiscord />} title='Discord account'>
          {discordInfo ? (
            <div style={{margin: 16, display: 'flex'}}>
              <Avatar mr={32} size={96} src={`${discordInfo.avatar}?size=96`} radius={100} />
              <div style={{flex: 1}}>
                {render(
                  ['Status', discordInfo ? 'Linked' : 'Unlinked'],
                  ['ID', discordInfo.id],
                  ['Username', `${discordInfo.username}#${discordInfo.tag}`]
                )}
                <ConfirmButton loading={busy} onClick={() =>
                  request({
                    endpoint: '/api/discord',
                    method: 'DELETE',
                    onDone: () =>
                      mutate(null, {
                        rollbackOnError: false
                      })
                  })} size='xs' leftIcon={<TbUnlink />} color='red' mt='xs'>
                  Unlink
                </ConfirmButton>
              </div>
            </div>
          ) : (
            <Stack m='lg' align='start'>
              <Text weight={700}>This account has not yet been linked, click the button below to link.</Text>
              <Button loading={busy} style={{backgroundColor: '#7289DA'}} onClick={() =>
                request({
                  endpoint: '/api/discord/auth',
                  callback: r => router.push(r.url)
                })} leftIcon={<SiDiscord />}>Link</Button>
            </Stack>
          )}
        </DashboardCard>
      </Stack>

      <Affix position={{bottom: 32, right: 32}} zIndex={0}>
        <Button.Group>
          <Button type='reset' form='account_form' leftIcon={<FiX />} variant='default'>
            Reset
          </Button>
          <Button type='submit' form='account_form' variant='default' leftIcon={<FiSave />}>
            Save
          </Button>
        </Button.Group>
      </Affix>
    </>
  );
}

Page_Account.title = 'Account';
Page_Account.authRequired = true;
