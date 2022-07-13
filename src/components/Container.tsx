import {Box, Center} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';

export default function Container({ height = '100vh', children, center = true, p = 'md', ...props }) {
  const { isDark, value } = useThemeValue();
  const box = (
    <Box sx={theme => ({ background: isDark && theme.fn.darken(theme.colors.dark[6], 0.25), borderRadius: 4, border: `solid 2px ${value(theme.fn.lighten(theme.colors.dark[1], 0.5), theme.colors.dark[5])}` })} p={p} {...props}>
      {children}
    </Box>
  );
  return center ? (
    <Center style={{ height }}>
      {box}
    </Center>
  ) : box;
}
