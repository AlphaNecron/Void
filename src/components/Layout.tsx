import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Center,
  Group,
  Header,
  Image,
  Indicator,
  Menu,
  Navbar,
  Progress,
  ScrollArea,
  Skeleton,
  Text,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme
} from '@mantine/core';
import {useMediaQuery, useSetState} from '@mantine/hooks';
import {NextLink} from '@mantine/next';
import NavigationItem from 'components/NavigationItem';
import ShareXIcon from 'components/ShareXIcon';
import UserAvatar from 'components/UserAvatar';
import useFetch from 'lib/hooks/useFetch';
import useSession from 'lib/hooks/useSession';
import useThemeValue from 'lib/hooks/useThemeValue';
import {hasPermission, isAdmin, Permission} from 'lib/permission';
import {prettyBytes, validateHex} from 'lib/utils';
import {useState} from 'react';
import {FiLogOut, FiUser} from 'react-icons/fi';
import {
  RiArchiveFill,
  RiDashboard3Fill,
  RiGlobalFill,
  RiGroupFill,
  RiLink,
  RiMoonClearFill,
  RiSunFill,
  RiTeamFill,
  RiTerminalWindowFill
} from 'react-icons/ri';
import {SiGithub} from 'react-icons/si';
import ShareX from './dialogs/ShareX';

function NavigationBar({user, onCollapse, route, quota, ...props}) {
  const [dialogOpen, setDialogOpen] = useSetState({sharex: false});
  const pages = [
    {
      icon: <RiDashboard3Fill/>,
      label: 'Dashboard',
      route: '/dash',
      color: 'void'
    },
    {
      icon: <RiArchiveFill/>,
      label: 'Files',
      route: '/dash/files',
      color: 'yellow',
    },
    {
      icon: <RiLink/>,
      label: 'URLs',
      route: '/dash/urls',
      color: 'green',
      permission: Permission.SHORTEN
    },
    {
      adminRequired: true,
      items: [
        {
          icon: <RiGroupFill/>,
          label: 'Users',
          route: '/dash/users',
          color: 'pink'
        },
        {
          icon: <RiTeamFill/>,
          label: 'Roles',
          route: '/dash/roles',
          color: 'teal'
        },
        {
          icon: <RiGlobalFill/>,
          label: 'Domains',
          route: '/dash/domains',
          color: 'grape'
        },
        {
          icon: <RiTerminalWindowFill/>,
          label: 'Panel',
          route: '/dash/panel',
          color: 'cyan'
        }
      ]
    }
  ];
  return (
    <>
      <ShareX open={dialogOpen.sharex} onClose={() => setDialogOpen({sharex: false})}/>
      <Navbar {...props}>
        <Navbar.Section grow component={ScrollArea} scrollbarSize={4}>
          {pages.map((x, i) =>
            (x.adminRequired && isAdmin(user.role.permissions) && x.items) ? (
              x.items.map(z =>
                <NavigationItem onClick={onCollapse} highlight={z.route === route} key={z.route} requiresAdmin
                  component={NextLink}
                  href={z.route} color={z.color} label={z.label} icon={z.icon}/>
              )
            ) : ((x.permission ? hasPermission(user.role.permissions, x.permission) : true) && !x.items) &&
              <NavigationItem onClick={onCollapse} highlight={x.route === route} component={NextLink} href={x.route}
                color={x.color}
                label={x.label} icon={x.icon} id={i} key={i}/>
          )}
        </Navbar.Section>
        <Navbar.Section>
          <Box
            sx={theme => ({
              paddingTop: theme.spacing.sm,
              marginTop: theme.spacing.sm,
              borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.dark[0]}`
            })}
          >
            <Menu withArrow position='top-start' transition='rotate-left'>
              <Menu.Target>
                <UnstyledButton
                  sx={theme => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    background: route === '/dash/account' && (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.dark[1]),
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.dark[0]
                    }
                  })}
                >
                  <Group align='center'>
                    <Indicator withBorder size={14} position='bottom-end' color='green' offset={5}>
                      <UserAvatar
                        user={user}
                        radius='xl'/>
                    </Indicator>
                    <Box>
                      <Text size='md' weight={600}>
                        {user.name || user.username || <p style={{ color: 'green'}}>Unknown</p>}
                      </Text>
                      <Text weight={600} sx={validateHex(user.role.color) && { color: user.role.color }} size='sm'>{user.role.name}</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown style={{ minWidth: 175 }}>
                {quota && (
                  <>
                    <Menu.Label>{prettyBytes(quota.used)} / {prettyBytes(quota.total)} used</Menu.Label>
                    <Progress value={quota.used / Math.max(quota.total, 1) * 100} size='sm' mb='sm' mx='xs'/>
                  </>
                )}
                <Menu.Divider/>
                <Menu.Item icon={<FiUser/>} component={NextLink} href='/dash/account' onClick={onCollapse}>Manage account</Menu.Item>
                <Menu.Item onClick={() => setDialogOpen({sharex: true})} icon={<ShareXIcon size={16}/>}>
                  ShareX config
                </Menu.Item>
                <Menu.Divider/>
                <Menu.Item icon={<FiLogOut/>} color='red' component={NextLink} href='/auth/logout'>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Navbar.Section>
      </Navbar>
    </>
  );
}

function AppHeader({children}) {
  const {toggleColorScheme} = useMantineColorScheme();
  const {value} = useThemeValue();
  return (
    <Header height={48} px='sm'>
      <Center style={{height: 48}}>
        <Group position='apart' style={{width: '100%'}}>
          {children}
          <Group spacing={8}>
            <Tooltip label='Void on GitHub'>
              <ActionIcon variant='filled' radius='md' size='lg' color='dark' component='a' target='_blank' href='https://github.com/AlphaNecron/Void'>
                <SiGithub/>
              </ActionIcon>
            </Tooltip>
            <Tooltip label={`Toggle ${value('dark', 'light')} theme`}>
              <ActionIcon variant='light' radius='md' color={value('purple', 'yellow')}
                onClick={() => toggleColorScheme()} size='lg'>
                {value(<RiMoonClearFill/>, <RiSunFill/>)}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Center>
    </Header>
  );
}

export default function Layout({children, route}) {
  const [opened, setOpened] = useState(false);
  const {data} = useFetch('/api/user/quota');
  const {breakpoints} = useMantineTheme();
  const smallWidth = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  const session = useSession();
  return session.isLogged ? (
    <AppShell
      navbarOffsetBreakpoint='md'
      padding='md'
      fixed
      navbar={
        <NavigationBar onCollapse={() => smallWidth && setTimeout(() => setOpened(false), 150)}
          hiddenBreakpoint='md' width={{md: 235}} hidden={!opened} p='md'
          route={route} quota={data ? {used: data.used, total: data.total} : null}
          user={session.user}/>
      }
      header={<AppHeader>
        {smallWidth ? (
          <Burger
            opened={opened}
            style={{height: 32, width: 32}}
            title='Open drawer'
            onClick={() => setOpened((o) => !o)}
            size='sm'
            mr='xl'
          />
        ) : (
          <Image src='/logo.png' height={32} width={32} alt='Void'/>
        )}
      </AppHeader>
      }
    >
      {children}
    </AppShell>
  ) : <Skeleton/>;
}
