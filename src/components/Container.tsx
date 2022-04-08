import { Box, Center, useMantineTheme } from '@mantine/core';
import React from 'react';

export default function Container({ height = '100vh', children, center = true, ...props }) {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';
  const box = (
    <Box sx={theme => ({ background: isDark && theme.fn.darken(theme.colors.dark[6], 0.25), padding: 16, borderRadius: 4, border: `2px ${isDark ? theme.colors.dark[6] : theme.colors.dark[0]} solid` })} {...props}>
      {children}
    </Box>
  );
  return center ? (
    <Center style={{ height }}>
      {box}
    </Center>
  ) : box;
}
