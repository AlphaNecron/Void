import { SimpleGrid } from '@mantine/core';
import { useMemo } from 'react';

export default function CardGrid({children, itemSize, maxItems = 4}) {
  const breakpoints = useMemo(() => {
    const bp = [
      {minWidth: 2 * itemSize, cols: 2}
    ];
    for (let i = 3; i <= maxItems; i++)
      bp.push({minWidth: (i + 1) * itemSize, cols: i});
    return bp;
  }, [maxItems, itemSize]);
  return (
    <SimpleGrid cols={1} breakpoints={breakpoints}>
      {children}
    </SimpleGrid>
  );
}
