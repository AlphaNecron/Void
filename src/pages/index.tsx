import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Index() {
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    router.push(session ? '/dash' : '/auth/login');
  }, [router]);
  return (
    <Head>
      <meta property='og:title' content='Void'/>
      <meta property='og:description' content='Free and open source file hosting service.'/>
      <meta property='theme-color' content='#B794F4'/>
    </Head>
  );
}

Index.title = 'Index';