import {Center, Loader, Overlay, Stack, Title} from '@mantine/core';
import React, {ReactElement, ReactNode} from 'react';

export default function Fallback({loaded, children}: { loaded: boolean, children: () => ReactNode }): ReactElement {
  return loaded ? (
    <div>
      {children()}
    </div>
  ) : (
    <Center style={{position: 'relative', height: 'calc(100% + 32px)', margin: -16}}>
      <Overlay opacity={0.035}/>
      <Stack align='center'>
        <Loader/>
        <Title order={4}>
          Fetching data, please wait...
        </Title>
      </Stack>
    </Center>
  );
}
