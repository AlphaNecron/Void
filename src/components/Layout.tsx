import { Box, Button, HStack, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, Skeleton, Spacer, useColorMode, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Edit, File, Home, Link2, LogOut, Moon, Sun, Tool, UploadCloud, User, Users } from 'react-feather';
import MediaQuery from 'react-responsive';
import ManageAccountDialog from './ManageAccountDialog';
import ShareXDialog from './ShareXDialog';

export default function Layout({ children, id, user }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { onClose: onShareXClose, isOpen: shareXOpen, onOpen: onShareXOpen } = useDisclosure();
  const { onClose: onManageClose, isOpen: manageOpen, onOpen: onManageOpen } = useDisclosure();
  const logout = async () => {
    setBusy(true);
    const userRes = await fetch('/api/user');
    if (userRes.ok) {
      const res = await fetch('/api/auth/logout');
      if (res.ok) router.push('/auth/login');
    } else {
      router.push('/auth/login');
    }
  };
  const pages = [
    {
      icon: Home,
      label: 'Dashboard',
      route: '/dash'
    },
    {
      icon: File,
      label: 'Files',
      route: '/dash/files'
    },
    {
      icon: UploadCloud,
      label: 'Upload',
      route: '/dash/upload'
    },
    {
      icon: Link2,
      label: 'URLs',
      route: '/dash/urls'
    },
    {
      icon: Users,
      label: 'Users',
      route: '/dash/users',
      adminRequired: true
    }
  ];
  return (
    <>
      {busy ? (
        <Skeleton mr={4} ml={4} mt={4} mb={4} height='96%' width='98%' m={4} pos='fixed'/>
      ) : (
        <>
          <Box h='48px' bg={useColorModeValue('gray.100', 'gray.900')} sx={{ zIndex: 100, position: 'sticky' }} top={0} right={0} left={0} p={1} boxShadow='base'>
            <HStack align='left'>
              {pages.map((page, i) => (
                <>
                  {(page.adminRequired && !user.isAdmin) || (
                    <>
                      <MediaQuery minWidth={pages.length * 150}>
                        <Link key={i} href={page.route} passHref>
                          <Button justifyContent='flex-start' colorScheme='purple' isActive={i === id} variant='ghost' leftIcon={<Icon as={page.icon}/>}>{page.label}</Button>
                        </Link>
                      </MediaQuery>
                      <MediaQuery maxWidth={pages.length * 150 - 1}>
                        <Link key={i} href={page.route} passHref>
                          <IconButton colorScheme='purple' aria-label={page.label} isActive={i === id} variant='ghost' icon={<Icon as={page.icon}/>}>{page.label}</IconButton>
                        </Link>
                      </MediaQuery>
                    </>
                  )}
                </>
              ))}
              <Spacer/>
              <IconButton aria-label='Theme toggle' onClick={toggleColorMode} variant='solid' colorScheme='purple' icon={colorMode === 'light' ? <Moon size={20}/> : <Sun size={20}/>}/>
              <Menu>
                <MenuButton
                  as={Button}
                  aria-label='Options'
                  leftIcon={<User size={16}/>}
                >{user.username}</MenuButton>
                <MenuList>
                  <MenuItem icon={<Edit size={16}/>} onClick={onManageOpen}>
                    Manage account
                  </MenuItem>
                  <MenuItem icon={<Tool size={16}/>} onClick={onShareXOpen}>
                    ShareX config
                  </MenuItem>
                  <MenuItem icon={<LogOut size={16}/>} onClick={logout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Box>
          <ManageAccountDialog onClose={onManageClose} open={manageOpen} user={user}/>
          <ShareXDialog onClose={onShareXClose} open={shareXOpen} token={user.token}/>
          {children}
        </>
      )}
    </>
  );
}