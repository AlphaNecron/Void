import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dash');
  }, [router]);
  return (
    <Head>
      <meta property='og:title' content='Draconic'/>
      <meta property='og:description' content='Free and open source file hosting service.'/>
    </Head>
  );
}
