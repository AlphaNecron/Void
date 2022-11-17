import { Button, Text } from '@mantine/core';
import Container from 'components/Container';
import { errors } from 'lib/constants';
import Head from 'next/head';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';

export default function Error({code, error}) {
  const title = `${code} ${error}`;
  const is404 = code === 404;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property='og:title' content={title} />
        <meta property='theme-color' content='#FC8181' />
      </Head>
      <Container py={64} px={128} style={{textAlign: 'center'}}>
        <Text weight={700} size={72} mb='sm' variant='gradient'
          gradient={{from: '#D1C4E9', to: '#5E35B1', deg: 30}}>{code}</Text>
        <Text mb='xl' size={20} weight={600}>{is404 ? (
          <>
            Looks like you are lost in the
            <Text span ml={4} variant='gradient' gradient={{from: '#D1C4E9', to: '#5E35B1', deg: 150}}>
              Void
            </Text>?
          </>
        ) : error}</Text>
        <Link href='/dash' passHref>
          <Button leftIcon={<IoIosArrowBack />}>Go back</Button>
        </Link>
      </Container>
    </>
  );
}

export async function getServerSideProps({res, err}) {
  const code = res ? res.statusCode : err ? err.statusCode : 404;
  return {
    props: {
      code,
      error: errors[String(code)]
    }
  };
}
