import {ColorScheme, ColorSchemeProvider, MantineProvider} from '@mantine/core';
import {useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {NotificationsProvider} from '@mantine/notifications';
import Layout from 'components/Layout';
import Dialog_FilesDeleted from 'dialogs/FilesDeleted';
import Dialog_Qr from 'dialogs/Qr';
import {hasPermission, isAdmin} from 'lib/permission';
import {SessionProvider, useSession} from 'next-auth/react';
import Head from 'next/head';
import React from 'react';

export default function Void({ Component, pageProps: { session, ...pageProps }, router }) {
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
        <MantineProvider emotionOptions={{ key: 'void' }} withGlobalStyles withNormalizeCSS theme={{
          colorScheme,
          loader: 'bars',
          primaryColor: 'void',
          fontFamily: 'Source Sans Pro, sans-serif',
          fontFamilyMonospace: 'JetBrains Mono, monospace',
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
          <ModalsProvider modals={{ qr: Dialog_Qr, deleted: Dialog_FilesDeleted }} modalProps={{ overlayBlur: 4, withCloseButton: true }}>
            <NotificationsProvider>
              <SessionProvider refetchOnWindowFocus={true} refetchInterval={300} session={session}>
                {(Component.authRequired || Component.adminOnly) ? (
                  <Auth adminOnly={Component.adminOnly} permission={Component.permission} router={router}>
                    <Layout route={router.route}>
                      <Component {...pageProps} />
                    </Layout>
                  </Auth>
                ) : (
                  <Component {...pageProps} />
                )}
              </SessionProvider>
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

function Auth({ children, permission, adminOnly, router }) {
  const { data, status } = useSession({ required: true });
  if (data?.user && status === 'authenticated' && !(adminOnly ? isAdmin(data?.user.permissions) : (permission || 0) !== 0 ? (hasPermission(data?.user.permissions, permission) || isAdmin(data?.user.permissions)) : true))
    router.push('/auth/login');
  return data?.user && status === 'authenticated' ? children : null;
}
