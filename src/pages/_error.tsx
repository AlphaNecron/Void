import { Button, Center, Heading, VStack } from '@chakra-ui/react';
import React from 'react';
import Link from 'next/link';
import { ArrowLeftCircle } from 'react-feather';

export default function Error({ code }) {
  const errors = {
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '402': 'Payment Required',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',
    '407': 'Proxy Authentication Required',
    '408': 'Request Timeout',
    '409': 'Conflict',
    '410': 'Gone',
    '411': 'Length Required',
    '412': 'Precondition Required',
    '413': 'Request Entry Too Large',
    '414': 'Request-URI Too Long',
    '415': 'Unsupported Media Type',
    '416': 'Requested Range Not Satisfiable',
    '417': 'Expectation Failed',
    '418': 'I\'m a teapot',
    '429': 'Too Many Requests',
    '500': 'Internal Server Error',
    '501': 'Not Implemented',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
    '505': 'HTTP Version Not Supported'
  };
  return (
    <Center h='100vh'>
      <VStack>
        <Heading>{code}: {errors[String(code)]}</Heading>
        <Link href='/dash' passHref>
          <Button justifyContent='flex-start' colorScheme='purple' leftIcon={<ArrowLeftCircle/>}>Go back</Button>
        </Link>
      </VStack>
    </Center>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const code = res ? res.statusCode : err ? err.statusCode : 404;
  return { code };
};