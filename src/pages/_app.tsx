import {ColorScheme, ColorSchemeProvider, MantineProvider, Progress, Transition} from '@mantine/core';
import {useInterval, useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {NotificationsProvider} from '@mantine/notifications';
import Layout from 'components/Layout';
import Dialog_FilesDeleted from 'dialogs/FilesDeleted';
import Dialog_FilesUploaded from 'dialogs/FilesUploaded';
import Dialog_Qr from 'dialogs/Qr';
import Dialog_UserInfo from 'dialogs/UserInfo';
import useSession from 'lib/hooks/useSession';
import {hasPermission, isAdmin} from 'lib/permission';
import Head from 'next/head';
import {useEffect, useState} from 'react';


export default function Void({Component, pageProps: {...pageProps}, router}) {
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
          loader: 'dots',
          primaryColor: 'void',
          fontFamily: 'Source Sans Pro, sans-serif',
          fontFamilyMonospace: 'JetBrains Mono, Source Code Pro, monospace',
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
          <ModalsProvider modals={{
            qr: Dialog_Qr,
            deleted: Dialog_FilesDeleted,
            uploaded: Dialog_FilesUploaded,
            info: Dialog_UserInfo
          }}
          modalProps={{overlayBlur: 4, withCloseButton: true}}>
            <NotificationsProvider>
              <Transition transition='slide-down' mounted={progress > 0 && progress < 100} duration={200}
                exitDuration={500}>
                {styles => (
                  <Progress size='xs' radius={0} value={progress} animate striped style={{ position: 'fixed', top: 0, left: 0, right: 0, ...styles }}/>
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
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

function Auth({
  children,
  permission,
  adminOnly,
  router
}) {
  const session = useSession(true, () => router.push('/auth/login'));
  const login = () => {
    router.push('/auth/login');
    return null;
  };
  if (session.isReady) {
    if (!session.isLogged)
      return login();
    if (adminOnly && !isAdmin(session.user.role.permissions))
      return login();
    if (permission && !hasPermission(session.user.role.permissions, permission))
      return login();
    return children;
  }
  return null;
}
