import {ColorScheme, ColorSchemeProvider, MantineProvider, Progress, Transition} from '@mantine/core';
import {useInterval, useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {NotificationsProvider} from '@mantine/notifications';
import Layout from 'components/Layout';
import Dialog_FilesDeleted from 'dialogs/FilesDeleted';
import Dialog_FilesUploaded from 'dialogs/FilesUploaded';
import Dialog_Qr from 'dialogs/Qr';
import {hasPermission, isAdmin} from 'lib/permission';
import {SessionProvider, useSession} from 'next-auth/react';
import Head from 'next/head';
import React, {useEffect, useState} from 'react';


export default function Void({Component, pageProps: {session, ...pageProps}, router}) {
  const [progress, setProgress] = useState(0);
  const ticker = useInterval(() => setProgress(c => c <= 75 ? c + 1 : c), 15e1);
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'void-color-scheme',
    defaultValue: 'dark',
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  useEffect(() => {
    const changeHandler = () => {
      setProgress(0);
      ticker.start();
    };
    const doneHandler = () => {
      ticker.stop();
      setProgress(100);
    };
    router.events.on('routeChangeStart', changeHandler);
    router.events.on('routeChangeComplete', doneHandler);
    router.events.on('routeChangeError', doneHandler);
    return () => {
      router.events.off('routeChangeStart', changeHandler);
      router.events.off('routeChangeComplete', doneHandler);
      router.events.off('routeChangeError', doneHandler);
    };
  }, []);
  return (
    <>
      <Head>
        <title>Void - {Component.title}</title>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width'/>
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider emotionOptions={{key: 'void'}} withGlobalStyles styles={{
          Menu: {
            label: {
              fontWeight: 600,
            },
            item: {
              fontWeight: 600
            }
          }
        }} withNormalizeCSS theme={{
          colorScheme,
          loader: 'bars',
          primaryColor: 'void',
          fontFamily: 'Source Sans Pro, sans-serif',
          fontFamilyMonospace: 'Source Code Pro, monospace',
          headings: {
            fontFamily: 'Source Sans Pro, sans-serif'
          },
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
          <ModalsProvider modals={{qr: Dialog_Qr, deleted: Dialog_FilesDeleted, uploaded: Dialog_FilesUploaded}}
            modalProps={{overlayBlur: 4, withCloseButton: true}}>
            <NotificationsProvider>
              <SessionProvider refetchOnWindowFocus={true} refetchInterval={300} session={session}>
                <Transition transition='slide-down' mounted={progress < 100 && progress > 0} duration={200} exitDuration={500}>
                  {styles => (
                    <Progress size='xs' radius={0} value={progress} animate striped style={styles}/>
                  )}
                </Transition>
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

function Auth({children, permission, adminOnly, router}) {
  const {data, status} = useSession({required: true});
  if (data?.user && status === 'authenticated' && !(adminOnly ? isAdmin(data?.user.permissions) : (permission || 0) !== 0 ? (hasPermission(data?.user.permissions, permission) || isAdmin(data?.user.permissions)) : true))
    router.push('/auth/login');
  return data?.user && status === 'authenticated' ? children : null;
}
