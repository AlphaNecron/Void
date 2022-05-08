import {SimpleGrid} from '@mantine/core';
import React from 'react';

export default function CardGrid({ children, itemSize }) {
  return (
    <SimpleGrid cols={1} breakpoints={[
      { minWidth: 6*itemSize, cols: 5 },
      { minWidth: 5*itemSize, cols: 4 },
      { minWidth: 4*itemSize, cols: 3 },
      { minWidth: 3*itemSize, cols: 2 },
      { minWidth: 2*itemSize, cols: 1 }
    ]}>
      {children}
    </SimpleGrid>
  );
}
