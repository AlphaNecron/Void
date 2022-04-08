import {Avatar, Button, Group, Stack, Title} from '@mantine/core';
import Container from 'components/Container';
import React, {useEffect} from 'react';
import {signOut, useSession} from 'next-auth/react';
import router from 'next/router';
import {FiChevronLeft, FiLogOut} from 'react-icons/fi';

export default function LogoutPage(){
  const { status, data: { user }} = useSession();
  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [router]);
  return status === 'unauthenticated' ? router.push('/auth/login') : status === 'loading' ? null : (
    <Container px={64}>
      <Stack align='center'>
        <Avatar radius={100} size={96} src={user.image}/>
        <Title order={4}>Signed in as {user.name}</Title>
        <Group spacing={4}>
          <Button color='green' onClick={() => router.back()} leftIcon={<FiChevronLeft/>}>Go back</Button>
          <Button color='red' onClick={async () => router.push((await signOut({ redirect: false, callbackUrl: '/auth/login' })).url)} leftIcon={<FiLogOut/>}>Logout</Button>
        </Group>
      </Stack>
    </Container>
  );
}

LogoutPage.authRequired = true;
LogoutPage.title = 'Logout';
