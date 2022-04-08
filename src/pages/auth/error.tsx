import { Text, Title } from '@mantine/core';
import Container from 'components/Container';
import React, { useEffect } from 'react';

export default function AuthError({ error }) {
  return (
    <Container>
      <Title order={2}>
        {error}
      </Title>
    </Container>
  );
}

export async function getServerSideProps({ query }) {
  const error = query.error || 'Unknown';
  return { props: { error }};
}