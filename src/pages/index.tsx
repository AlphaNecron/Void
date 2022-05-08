import {useSession} from 'next-auth/react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useEffect} from 'react';

export default function Index() {
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    router.push(session ? '/dash' : '/auth/login');
  }, [router]);
  return (
    <Head>
      <title>Void</title>
      <meta property='og:title' content='Void'/>
      <meta property='og:description' content='Free and open source file hosting service.'/>
      <meta property='theme-color' content='#B794F4'/>
    </Head>
  );
}
