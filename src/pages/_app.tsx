import { ChakraProvider } from '@chakra-ui/react';
import { useStore } from 'lib/redux/store';
import Head from 'next/head';
import React from 'react';
import { Provider } from 'react-redux';

export default function Draconic({ Component, pageProps }) {
  const store = useStore();
  return (
    <Provider store={store}>
      <Head>
        <title>{Component.title}</title>
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width'/>
      </Head>
      <ChakraProvider>
        <Component {...pageProps}/>
      </ChakraProvider>
    </Provider>
  );
}
