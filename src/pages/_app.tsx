import {
  ColorScheme,
  ColorSchemeProvider,
  createEmotionCache,
  MantineProvider,
  Progress,
  Transition
} from '@mantine/core';
import {useInterval, useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {NotificationsProvider} from '@mantine/notifications';
import Dialog_Qr from 'dialogs/Qr';
import useSession from 'lib/hooks/useSession';
import {hasPermission, isAdmin} from 'lib/permission';
import {createTheme} from 'lib/theme';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import {useEffect, useState} from 'react';

const cache = createEmotionCache({key: 'void'});

const Layout = dynamic(() => import('components/Layout'));

export default function Void({Component, pageProps, router}) {
  const [progress, setProgress] = useState(0);
  const ticker = useInterval(() => setProgress(c => c <= 75 ? c + 1 : c), 250);
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'void-color-scheme',
    defaultValue: 'dark',
    getInitialValueInEffect: true
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  useEffect(() => {
    const onStart = () => {
      setProgress(0);
      ticker.start();
    };
    const onDone = () => {
      ticker.stop();
      setProgress(100);
    };

    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);
    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
    };
  }, []);
  return (
    <>
      <Head>
        <title>Void - {Component.title}</title>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width' />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider emotionCache={cache} withGlobalStyles withNormalizeCSS theme={createTheme(colorScheme)}>
          <Transition transition='slide-down' mounted={progress > 0 && progress < 100} duration={200}
            exitDuration={500}>
            {styles => (
              <Progress size='xs' radius={0} value={progress}
                style={{position: 'fixed', top: 0, left: 0, right: 0, background: 'transparent', ...styles}} />
            )}
          </Transition>
          <ModalsProvider modals={{
            qr: Dialog_Qr
          }}
          modalProps={{overlayBlur: 4, withCloseButton: true}}>
            <NotificationsProvider>
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
