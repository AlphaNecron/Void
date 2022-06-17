import {Button, Group, Stack, Title} from '@mantine/core';
import Container from 'components/Container';
import UserAvatar from 'components/UserAvatar';
import {signOut, useSession} from 'next-auth/react';
import router from 'next/router';
import React, {useEffect} from 'react';
import {FiChevronLeft, FiLogOut} from 'react-icons/fi';

export default function LogoutPage() {
  const {status, data} = useSession();
  useEffect(() => {
    if (!data?.user) router.push('/auth/login');
  }, [data]);
  return status === 'unauthenticated' ? router.push('/auth/login') : status === 'loading' ? null : (
    <Container px={64}>
      <Stack align='center'>
        <UserAvatar size={96} user={data?.user}/>
        <Title order={4}>Signed in as {data?.user.name}</Title>
        <Group spacing={4}>
          <Button color='green' onClick={() => router.back()} leftIcon={<FiChevronLeft/>}>Go back</Button>
          <Button color='red'
            onClick={() => signOut({callbackUrl: '/'})}
            leftIcon={<FiLogOut/>}>Logout</Button>
        </Group>
      </Stack>
    </Container>
  );
}

LogoutPage.title = 'Logout';
