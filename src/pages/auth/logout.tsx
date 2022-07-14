import {Button, Group, Stack, Title} from '@mantine/core';
import Container from 'components/Container';
import UserAvatar from 'components/UserAvatar';
import useSession from 'lib/hooks/useSession';
import router from 'next/router';
import {FiChevronLeft, FiLogOut} from 'react-icons/fi';

export default function LogoutPage() {
  const { isLogged, user, revalidate } = useSession(true, () => router.push('/auth/login'));
  const logOut = () => fetch('/api/auth/logout').finally(() => {
    router.push('/auth/login');
    revalidate();
  });
  return isLogged && (
    <Container px={64} pt={32}>
      <Stack align='center'>
        <UserAvatar size={128} user={user}/>
        <Title order={4}>Signed in as {user.name || user.username || user.id}</Title>
        <Group spacing={4}>
          <Button color='green' onClick={() => router.back()} leftIcon={<FiChevronLeft/>}>Go back</Button>
          <Button color='red'
            onClick={() => logOut()}
            leftIcon={<FiLogOut/>}>Logout</Button>
        </Group>
      </Stack>
    </Container>
  );
}

LogoutPage.title = 'Logout';
