import { ColorModeScript } from '@chakra-ui/react';
import NextDocument, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang='en'>
        <Head/>
        <body>
          <ColorModeScript initialColorMode='dark'/>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    );
  }
}