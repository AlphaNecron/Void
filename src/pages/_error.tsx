import { Center, Button, Title } from '@mantine/core';
import { errors } from 'lib/constants';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import Container from 'components/Container';

export default function Error({ title }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property='og:title' content={title}/>
        <meta property='theme-color' content='#FC8181'/>
      </Head>
      <Container py={64} px={96}>
        <Title order={2} mb='xl'>{title}</Title>
        <Link href='/dash' passHref>
          <Button fullWidth leftIcon={<IoIosArrowBack/>}>Go back</Button>
        </Link>
      </Container>
    </>
  );
}

export async function getServerSideProps({ res, err }) {
  const code = res ? res.statusCode : err ? err.statusCode : 404;
  const title = `${code} ${errors[String(code)]}`;
  return {
    props: {
      title
    }
  };
};