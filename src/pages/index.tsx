import useSession from 'lib/hooks/useSession';
import Head from 'next/head';
import router from 'next/router';

export default function Index() {
  useSession(true, () =>
    router.push('/auth/login'), () => router.push('/dash'));
  return (
    <Head>
      <title>Void</title>
      <meta property='og:title' content='Void'/>
      <meta property='og:description' content='Free and open source file hosting service.'/>
      <meta property='theme-color' content='#B794F4'/>
    </Head>
  );
}
