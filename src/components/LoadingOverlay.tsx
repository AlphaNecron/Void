import { Center, Loader, Overlay, Stack, Title } from '@mantine/core';

export default function LoadingOverlay() {
  return (
    <Center style={{height: '100vh', width: '100vw'}}>
      <Overlay opacity={0.02} zIndex={1} />
      <Stack align='center'>
        <Loader />
        <Title order={4}>
          Acquiring required data, please wait...
        </Title>
      </Stack>
    </Center>
  );
}
