import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Center,
  Divider,
  Group,
  Header,
  Image,
  Indicator,
  LoadingOverlay,
  Menu,
  Navbar,
  Paper,
  ScrollArea,
  Skeleton,
  Text,
  Transition,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme
} from '@mantine/core';
import {useMediaQuery, useSetState} from '@mantine/hooks';
import {NextLink} from '@mantine/next';
import ShareX from 'components/dialogs/ShareX';
import NavigationItem from 'components/NavigationItem';
import ShareXIcon from 'components/ShareXIcon';
import StyledTooltip from 'components/StyledTooltip';
import UserAvatar from 'components/UserAvatar';
import useThemeValue from 'lib/hooks/useThemeValue';
import {hasPermission, isAdmin, Permission} from 'lib/permission';
import {useSession} from 'next-auth/react';
import React, {useState} from 'react';
import {FiLogOut, FiUser} from 'react-icons/fi';
import {
  RiArchiveFill,
  RiDashboard3Fill,
  RiGlobalFill,
  RiGroupFill,
  RiLink,
  RiMoonClearFill,
  RiShieldStarFill,
  RiSunFill,
  RiTeamFill,
  RiTerminalWindowFill
} from 'react-icons/ri';

function NavigationBar({user, route, ...props}) {
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
      icon: <RiShieldStarFill/>,
      label: 'Administration',
      color: 'red',
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
      <Navbar style={{transition: 'width 400ms ease, min-width 400ms ease'}} {...props}>
        <Navbar.Section grow component={ScrollArea} scrollbarSize={4}>
          {pages.map((x, i) =>
            (x.adminRequired && isAdmin(user.permissions) && x.items) ? (
              x.items.map(z =>
                <NavigationItem highlight={z.route === route} key={z.route} requiresAdmin component={NextLink}
                  href={z.route} color={z.color} label={z.label} icon={z.icon}/>
              )
            ) : ((x.permission ? hasPermission(user.permissions, x.permission) : true) && !x.items) &&
              <NavigationItem highlight={x.route === route} component={NextLink} href={x.route} color={x.color}
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
            <Menu styles={{
              root: {
                width: '100%'
              }
            }} placement='end' withArrow control={
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
                      radius='xl'
                      color='void'/>
                  </Indicator>
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
              <Menu.Item onClick={() => setDialogOpen({sharex: true})} icon={<ShareXIcon size={16}/>}>ShareX
                config</Menu.Item>
              <Divider/>
              <Menu.Item icon={<FiLogOut/>} color='red' component={NextLink} href='/auth/logout'>Logout</Menu.Item>
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
          <StyledTooltip label={`Toggle ${value('dark', 'light')} theme`}>
            <ActionIcon variant='light' radius='md' color={value('purple', 'yellow')}
              onClick={() => toggleColorScheme()} size='lg'>
              {value(<RiMoonClearFill/>, <RiSunFill/>)}
            </ActionIcon>
          </StyledTooltip>
        </Group>
      </Center>
    </Header>
  );
}

export default function Layout({children, route}) {
  const [opened, setOpened] = useState(false);
  let status: string, user: { id?: string, role: string, name?: string, email?: string, image?: string };
  const {breakpoints} = useMantineTheme();
  const smallWidth = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
  try {
    ({status, data: {user}} = useSession());
  } catch {
    return <LoadingOverlay visible={true}/>;
  }
  return status === 'authenticated' ? (
    <AppShell styles={{
      main: {transition: 'padding-left 400ms ease'}
    }}
    navbarOffsetBreakpoint='md'
    padding='md'
    fixed
    navbar={
      <Transition transition='slide-right' duration={400} mounted={opened || !smallWidth}>
        {styles => (
          <NavigationBar hiddenBreakpoint='md' style={styles} width={{md: 275}} hidden={!opened} p='md'
            route={route}
            user={user}/>
        )}
      </Transition>
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
