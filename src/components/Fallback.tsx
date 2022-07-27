import {Center, Loader, Overlay} from '@mantine/core';
import React, {ReactNode} from 'react';

export default function Fallback({loaded, children}: { loaded: boolean, children: () => any }) {
  return loaded ? children() : (
    <Center style={{position: 'relative', height: 'calc(100% + 32px)', margin: -16}}>
      <Overlay opacity={0.035}/>
      <Loader/>
    </Center>
  );
}
