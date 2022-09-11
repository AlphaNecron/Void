import {createGetInitialProps} from '@mantine/next';
import Document, {Head, Html, Main, NextScript} from 'next/document';

export default class _Document extends Document {
  static getInitialProps = createGetInitialProps();

  render() {
    return (
      <Html>
        <Head>
          <link
            href='https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=optional'
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
}
