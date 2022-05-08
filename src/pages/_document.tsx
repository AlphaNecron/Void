import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { createGetInitialProps } from '@mantine/next';

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href='https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Source+Sans+Pro:wght@400;600&display=swap'
            rel='stylesheet'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
  static getInitialProps = getInitialProps;
}