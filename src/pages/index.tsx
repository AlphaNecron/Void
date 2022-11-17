import { Button, Center, Stack, Text, Title } from '@mantine/core';
import NextLink from 'components/NextLink';
import useSession from 'lib/hooks/useSession';
import Head from 'next/head';
import { FiChevronRight, FiEdit2, FiLogIn, FiLogOut } from 'react-icons/fi';

export default function Index() {
  const {isLogged} = useSession();
  return (
    <>
      <Head>
        <meta property='og:title' content='Void' />
        <meta property='og:description' content='Free and open source file hosting service.' />
        <meta property='theme-color' content='#B794F4' />
      </Head>
      <div style={{width: '100vw', height: '100vh'}}>
        <Center>
          <Stack style={{
            justifyContent: 'center',
            height: 360,
            borderRadius: '28px',
            marginTop: '4vh',
            width: '96vw',
            textAlign: 'center',
            backgroundRepeat: 'repeat-x',
            backgroundImage: 'url(/background.svg)'
          }}>
            <Text size={48} weight={600} ml={4} variant='gradient'
              gradient={{from: '#D1C4E9', to: '#5E35B1', deg: 120}}>
              Void
            </Text>
            <Title order={3}>
              Free and open source file hosting service.
            </Title>
            <Button.Group style={{alignSelf: 'center'}}>
              {isLogged ? (
                <>
                  <Button leftIcon={<FiChevronRight />} component={NextLink} href='/dash'>
                    Navigate to the Void
                  </Button>
                  <Button variant='default' rightIcon={<FiLogOut />} component={NextLink} href='/auth/logout'>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button leftIcon={<FiLogIn />} component={NextLink} href='/auth/login'>
                    Login
                  </Button>
                  <Button variant='default' rightIcon={<FiEdit2 />} component={NextLink} href='/auth/register'>
                    Register
                  </Button>
                </>
              )}
            </Button.Group>
          </Stack>
        </Center>
      </div>
    </>
  );
}
