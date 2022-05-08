import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Center,
  Divider,
  Group,
  Header,
  Image,
  LoadingOverlay,
  Menu,
  Navbar,
  Paper,
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
import ShareX from 'components/dialogs/ShareX';
import NavigationItem from 'components/NavigationItem';
import ShareXIcon from 'components/ShareXIcon';
import useThemeValue from 'lib/hooks/useThemeValue';
import {hasPermission, isAdmin, Permission} from 'lib/permission';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {FiLogOut, FiUser} from 'react-icons/fi';
import {
  RiArchiveFill,
  RiDashboard3Fill,
  RiGlobalFill,
  RiGroupFill,
  RiLink,
  RiMoonClearFill,
  RiRefreshLine,
  RiScissorsFill,
  RiShieldStarFill,
  RiSunFill,
  RiTeamFill,
  RiTerminalWindowFill,
  RiUploadCloudFill
} from 'react-icons/ri';

function NavigationBar({ user, id, ...props }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useSetState({ sharex: false });
  const pages = [
    {
      icon: <RiDashboard3Fill />,
      label: 'Dashboard',
      route: '/dash',
      color: 'void'
    },
    {
      icon: <RiArchiveFill />,
      label: 'Files',
      route: '/dash/files',
      color: 'yellow',
    },
    {
      icon: <RiUploadCloudFill />,
      label: 'Upload',
      route: '/dash/upload',
      color: 'blue'
    },
    {
      icon: <RiScissorsFill />,
      label: 'Shorten',
      route: '/dash/shorten',
      color: 'orange',
      permission: Permission.SHORTEN
    },
    {
      icon: <RiLink />,
      label: 'URLs',
      route: '/dash/urls',
      color: 'green',
      permission: Permission.SHORTEN
    },
    {
      icon: <RiShieldStarFill/>,
      label: 'Administration',
      color: 'red',
      adminRequired: true,
      items: [
        {
          icon: <RiGroupFill />,
          label: 'Users',
          route: '/dash/users',
          color: 'pink'
        },
        {
          icon: <RiTeamFill />,
          label: 'Roles',
          route: '/dash/roles',
          color: 'teal'
        },
        {
          icon: <RiGlobalFill />,
          label: 'Domains',
          route: '/dash/domains',
          color: 'grape'
        },
        {
          icon: <RiTerminalWindowFill />,
          label: 'Panel',
          route: '/dash/panel',
          color: 'cyan'
        }
      ]
    }
  ];
  return (
    <>
      <ShareX open={dialogOpen.sharex} onClose={() => setDialogOpen({ sharex: false })}/>
      <Navbar {...props}>
        <Navbar.Section grow component={ScrollArea} scrollbarSize={4}>
          {pages.map((x, i) =>
            (x.adminRequired && isAdmin(user.permissions) && x.items) ? (
              x.items.map((z, j) =>
                <NavigationItem key={j} requiresAdmin onClick={() => router.push(z.route)} color={z.color} label={z.label} icon={z.icon} id={i+j} currentPageId={id}/>
              )
            ) : ((x.permission ? hasPermission(user.permissions, x.permission) : true) && !x.items) &&
            <NavigationItem onClick={() => router.push(x.route)} color={x.color} label={x.label} icon={x.icon} id={i} currentPageId={id}/>
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
            <Menu styles={{
              root: {
                width: '100%'
              },
              itemLabel: {
                fontWeight: 'bold'
              }
            }} placement='end' withArrow control={
              <UnstyledButton
                sx={theme => ({
                  display: 'block',
                  width: '100%',
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.sm,
                  background: (id === (id < pages.length ? pages.length : pages.length + pages[pages.length - 1].items.length - 1)) && (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.dark[1]),
                  color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                  '&:hover': {
                    backgroundColor:
                                  theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.dark[0]
                  }
                })}
              >
                <Group align='center'>
                  <Avatar
                    src={user.image}
                    radius='xl'
                  />
                  <Box>
                    <Text size='md' weight={600}>
                      {user.name}
                    </Text>
                    <Text weight={600} color='dimmed' size='sm'>{user.role}</Text>
                  </Box>
                </Group>
              </UnstyledButton>
            }>
              <Menu.Item icon={<FiUser/>} component={NextLink} href='/dash/account'>Manage account</Menu.Item>
              <Menu.Item onClick={() => setDialogOpen({ sharex: true })} icon={<ShareXIcon size={16}/>}>ShareX config</Menu.Item>
              <Divider/>
              <Menu.Item icon={<FiLogOut/>} color='red' component={NextLink} href='/auth/logout'>Logout</Menu.Item>
            </Menu>
          </Box>
        </Navbar.Section>
      </Navbar>
    </>
  );
}

function AppHeader({ children, onReload, searchBar, rightChildren }) {
  const { toggleColorScheme } = useMantineColorScheme();
  const { value } = useThemeValue();
  return (
    <Header height={48} px='sm'>
      <Center style={{ height: 48 }}>
        <Group position='apart' style={{ width: '100%' }}>
          {children}
          {searchBar}
          <Group spacing={4}>
            {rightChildren}
            {onReload && (
              <Tooltip label='Refresh data'>
                <ActionIcon variant='default' onClick={() => onReload()} size='lg'>
                  <RiRefreshLine/>
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label={`Toggle ${value('dark', 'light')} theme`}>
              <ActionIcon variant='hover' color={value('purple', 'yellow')} onClick={() => toggleColorScheme()} size='lg'>
                {value(<RiMoonClearFill />, <RiSunFill />)}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Center>
    </Header>
  );
}

export default function Layout({ onReload = null, children, id, searchBar = null, rightChildren = null, side = null }) {
  const [opened, setOpened] = useState(false);
  let status: string, user: { id?: string, role: string, name?: string, email?: string, image?: string };
  const { breakpoints } = useMantineTheme();
  const smallWidth = useMediaQuery(`(max-width: ${breakpoints.sm}px)`);
  try {
    ({ status, data: { user } } = useSession());
  } catch {
    return <LoadingOverlay visible={true}/>;
  }
  return status === 'authenticated' ? (
    <AppShell
      navbarOffsetBreakpoint='sm'
      padding='md'
      fixed
      aside={side || <></>}
      navbar={<NavigationBar hiddenBreakpoint='sm' width={{ base: 300 }} hidden={!opened} p='md' id={id} user={user} />}
      header={<AppHeader rightChildren={rightChildren || <></>} onReload={onReload} searchBar={searchBar || <></>}>
        {smallWidth ? (
          <Burger
            opened={opened}
            style={{ height: 32, width: 32 }}
            title='Open drawer'
            onClick={() => setOpened((o) => !o)}
            size='sm'
            mr='xl'
          />
        ) : (
          <Image src='/logo.png' height={32} alt='Void'/>
        )}
      </AppHeader>}
    >
      <Paper>
        {children}
      </Paper>
    </AppShell>
  ) : status === 'loading' ? (
    <Skeleton/>
  ) : null;
}
