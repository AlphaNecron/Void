import {ColorScheme, ColorSchemeProvider, MantineProvider, Title} from '@mantine/core';
import {useLocalStorage} from '@mantine/hooks';
import {NotificationsProvider} from '@mantine/notifications';
import {SessionProvider, useSession} from 'next-auth/react';
import Head from 'next/head';
import React from 'react';
import {hasPermission, isAdmin} from 'lib/permission';
import Container from 'components/Container';

export default function Void({ Component, pageProps: { session, ...pageProps } }) {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'void-color-scheme',
    defaultValue: 'dark',
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  return (
    <>
      <Head>
        <title>Void - {Component.title}</title>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{
          colorScheme,
          loader: 'bars',
          primaryColor: 'void',
          fontFamily: 'Source Sans Pro',
          fontFamilyMonospace: 'JetBrains Mono',
          fontSizes: {
            xs: 13,
            sm: 14,
            md: 15,
            lg: 17,
            xl: 20
          },
          colors: {
            'void': [
              '#C6C0D0',
              '#B2A9C3',
              '#9F92B9',
              '#8C79B3',
              '#7B60B2',
              '#6A47B2',
              '#5C34AE',
              '#573A92',
              '#513C7B',
              '#4B3C69'
            ],
          }
        }}>
          <NotificationsProvider>
            <SessionProvider refetchOnWindowFocus={true} refetchInterval={300} session={session}>
              {(Component.authRequired || Component.adminOnly) ? (
                <Auth adminOnly={Component.adminOnly || false} permission={(Component.permission)} >
                  <Component {...pageProps} />
                </Auth>
              ) : (
                <Component {...pageProps} />
              )}
            </SessionProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider></>
  );
}

function Auth({ children, permission, adminOnly }) {
  const { data, status } = useSession({ required: true });
  if (data?.user && status === 'authenticated' && !(adminOnly ? isAdmin(data?.user.permissions) : (permission || 0) !== 0 ? (hasPermission(data?.user.permissions, permission) || isAdmin(data?.user.permissions)) : true))
    return (
      <>
        <Head>
          <title>Insufficient permission</title>
        </Head>

        <Container>
          <Title order={4} m='xl' align='center'>
      You do not have permission to access this page.
          </Title>
        </Container>
      </>
    );
  return data?.user && status === 'authenticated' ? children : null;
}
