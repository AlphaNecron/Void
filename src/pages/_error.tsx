import { Button, Center, Heading, VStack } from '@chakra-ui/react';
import { errors } from 'lib/constants';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { ArrowLeftCircle } from 'react-feather';

export default function Error({ title }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property='og:title' content={title}/>
        <meta property='theme-color' content='#FC8181'/>
      </Head>
      <Center h='100vh'>
        <VStack>
          <Heading>{title}</Heading>
          <Link href='/dash' passHref>
            <Button justifyContent='flex-start' colorScheme='purple' leftIcon={<ArrowLeftCircle/>}>Go back</Button>
          </Link>
        </VStack>
      </Center>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const code = res ? res.statusCode : err ? err.statusCode : 404;
  const title = `${code} ${errors[String(code)]}`;
  return { title };
};