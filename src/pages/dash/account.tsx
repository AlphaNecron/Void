import {
  ActionIcon,
  Affix,
  Button,
  Checkbox,
  ColorInput,
  Container,
  CSSObject,
  Group,
  Highlight,
  Image,
  LoadingOverlay,
  MantineTheme,
  Popover,
  Stack,
  Table,
  TextInput
} from '@mantine/core';
import {useForm, yupResolver} from '@mantine/form';
import {useClipboard, useDisclosure} from '@mantine/hooks';
import {showNotification} from '@mantine/notifications';
import DashboardCard from 'components/DashboardCard';
import UpdateAvatarDialog from 'components/dialogs/UpdateAvatar';
import PasswordBox from 'components/PasswordBox';
import StyledTooltip from 'components/StyledTooltip';
import TextPair from 'components/TextPair';
import UserAvatar from 'components/UserAvatar';
import useSession from 'lib/hooks/useSession';
import useThemeValue from 'lib/hooks/useThemeValue';
import {useRouter} from 'next/router';
import {useState} from 'react';
import {FaUserCheck, FaUserCircle} from 'react-icons/fa';
import {FiInfo, FiSave} from 'react-icons/fi';
import {IoCopyOutline, IoEyeOffOutline, IoEyeOutline, IoRefreshOutline} from 'react-icons/io5';
import {RiBracesFill, RiClipboardFill, RiErrorWarningFill, RiKey2Fill, RiKeyLine} from 'react-icons/ri';
import {SiDiscord} from 'react-icons/si';
import useSWR from 'swr';
import * as yup from 'yup';

export default function Page_Account() {
  const [reveal, setReveal] = useState(false);
  const { isLogged, user } = useSession();
  const clipboard = useClipboard({timeout: 500});
  const [open, handler] = useDisclosure(false);
  const { reload } = useRouter();
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const schema = yup.object({
    name: yup.string().min(2, {message: 'Display name should be longer than 2 characters.'}).max(12, 'Display name should not longer than 12 characters.'),
    username: yup.string().nullable().matches(/^(\S+)([A-Za-z_]\w*)$/ug, 'Username must be alphanumeric.').min(3, {message: 'Username should be longer than 3 characters.'}),
    password: yup.string().nullable().test('password', 'Password must match shown criteria.', pwd => pwd.length <= 0 || /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{6,}$/g.test(pwd)),
    embedEnabled: yup.boolean().required(),
    embedColor: yup.string().nullable().matches(/^#([\da-f]{3}|[\da-f]{6})$/i, {excludeEmptyString: false}),
    embedSiteName: yup.string().nullable(),
    embedSiteNameUrl: yup.string().url().nullable(),
    embedTitle: yup.string().nullable(),
    embedDescription: yup.string().nullable(),
    embedAuthor: yup.string().nullable(),
    embedAuthorUrl: yup.string().url().nullable()
  });
  const form = useForm({
    schema: yupResolver(schema),
    initialValues: isLogged && { ...user, password: '' }
  });
  const {data: dataToken, mutate: mutateToken} = useSWR('/api/user/token', fetcher);
  const {value} = useThemeValue();
  const regenToken = () => {
    fetch('/api/user/token', {
      method: 'PATCH',
    })
      .then(r => r.json())
      .then(t => {
        if (t.newToken) {
          showNotification({
            title: 'Successfully regenerated your private token.',
            message: '',
            color: 'green',
            icon: <RiKey2Fill/>
          });
          mutateToken();
        }
      });
  };
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
    fetch('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(r => r.json()).then(r => {
      if (!r.error)
        showNotification({
          title: 'Successfully updated your user.',
          icon: <FaUserCheck/>,
          message: '',
          color: 'green'
        });
      else showNotification({
        title: 'Failed to update your user.',
        message: r.error,
        color: 'red',
        icon: <RiErrorWarningFill/>
      });
      reload();
    });
  const [opened, dHandler] = useDisclosure(false);
  return isLogged ? (
    <>
      <UpdateAvatarDialog opened={opened} onClose={dHandler.close} onDone={reload}/>
      <form id='account_form' onSubmit={form.onSubmit(updateUser)}>
        <DashboardCard icon={<FaUserCircle/>} title='Basic information' mb='md'>
          <div style={{display: 'flex', alignItems: 'center', marginTop: 8}}>
            <Stack align='end' mr='sm'>
              <UserAvatar size={128} mx='sm' user={user}/>
              <Button variant='subtle' fullWidth onClick={dHandler.open}>
                Update avatar
              </Button>
            </Stack>
            <Stack style={{flex: 1}}>
              <Group grow>
                <TextInput label='Display name' description='Can be your real name or whatever you like'
                  placeholder='Display name' {...form.getInputProps('name')}/>
                <TextInput label='Username' description='The unique username used to login to your account'
                  placeholder='Username' {...form.getInputProps('username')} required/>
              </Group>
              <PasswordBox
                label='Password'
                autoComplete='new-password'
                placeholder='New password'
                description='Strong password should include letters in lower and uppercase, at least 1 number, at least 1 special symbol'
                {...form.getInputProps('password')}/>
            </Stack>
          </div>
        </DashboardCard>
        {dataToken && (
          <DashboardCard icon={<RiKey2Fill/>} title='Private token' mb='md'>
            <TextInput color='red' mt='md' value={dataToken.privateToken} type={reveal ? 'text' : 'password'}
              description='Remember to keep it safe or people can upload on behalf of you'
              placeholder='Click Regenerate to generate one.' rightSectionWidth={96} rightSection={
                <>
                  <StyledTooltip label={reveal ? 'Hide' : 'Show'}>
                    <ActionIcon onClick={() => setReveal(!reveal)}>
                      {reveal ? <IoEyeOffOutline/> : <IoEyeOutline/>}
                    </ActionIcon>
                  </StyledTooltip>
                  <StyledTooltip label='Copy'>
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
                  </StyledTooltip>
                  <StyledTooltip label='Regenerate'>
                    <ActionIcon onClick={regenToken}>
                      <IoRefreshOutline/>
                    </ActionIcon>
                  </StyledTooltip>
                </>
              } readOnly icon={<RiKeyLine/>} autoComplete='one-time-code'/>
          </DashboardCard>
        )}
        <DashboardCard icon={<RiBracesFill/>} rightItem={
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
        } title='Embed' mb='md'>
          <div style={{display: 'flex', alignItems: 'center', marginTop: 8}}>
            <Stack style={{flex: 1}}>
              <Checkbox label='Enable embed' {...form.getInputProps('embedEnabled', {type: 'checkbox'})}/>
              <Group grow>
                <TextInput maxLength={32} label='Site name'
                  placeholder='Embed site name' {...form.getInputProps('embedSiteName')}/>
                <TextInput maxLength={32} label='Site name URL'
                  placeholder='Embed site name URL' {...form.getInputProps('embedSiteNameUrl')}/>
              </Group>
              <Group grow>
                <TextInput maxLength={32} label='Title'
                  placeholder='Embed title' {...form.getInputProps('embedTitle')}/>
                <ColorInput style={{flex: 1}} label='Color'
                  placeholder='Embed color' {...form.getInputProps('embedColor')}/>
              </Group>
              <TextInput label='Description' maxLength={64}
                placeholder='Embed description' {...form.getInputProps('embedDescription')}/>
              <Group grow>
                <TextInput maxLength={32} label='Author' placeholder='Author' {...form.getInputProps('embedAuthor')}/>
                <TextInput label='Author URL' placeholder='Author URL' {...form.getInputProps('embedAuthorUrl')}/>
              </Group>
            </Stack>
            <Container py={4} ml='md' px={10} style={{
              borderLeft: `3px solid ${form.values.embedColor}`,
              borderRadius: 4,
              background: '#2F3136',
              width: 480
            }}>
              <Highlight target='_blank' style={{fontSize: 12}} color='dimmed'
                highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} component='a'
                variant='link'
                href={form.values.embedSiteNameUrl}>{form.values.embedSiteName || 'Site name'}</Highlight>
              <Highlight target='_blank' highlight={Object.keys(variables).map(x => `{{${x}}}`)}
                highlightStyles={hlStyle} component='a' variant='link'
                style={{fontSize: 14, display: 'block', color: 'white'}}
                href={form.values.embedAuthorUrl}>{form.values.embedAuthor || 'Author'}</Highlight>
              <Highlight target='_blank' component='a' href='/random' variant='link'
                highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} weight={600}
                color='blue' style={{fontSize: 16}}>{form.values.embedTitle || 'Title'}</Highlight>
              <Highlight style={{wordWrap: 'break-word', color: '#bbb'}}
                highlight={Object.keys(variables).map(x => `{{${x}}}`)} highlightStyles={hlStyle} size='sm'
                color='white'>{form.values.embedDescription || 'Description'}</Highlight>
              <Image fit='contain' height={225} src='/banner.png' alt='Preview image'/>
            </Container>
          </div>
        </DashboardCard>
      </form>
      <DashboardCard icon={<SiDiscord/>} title='Discord account'>
        <Stack m='xs'>
          <TextPair label='Status' value='Linked'/>
        </Stack>
      </DashboardCard>
      <Affix position={{bottom: 32, right: 32}} zIndex={0}>
        <Button size='md' type='submit' form='account_form' color='green' variant={value('outline', 'light')}
          leftIcon={<FiSave/>}>Save</Button>
      </Affix>
    </>
  ) : <LoadingOverlay visible={true}/>;
}

Page_Account.title = 'Account';
Page_Account.authRequired = true;
