import { Center, Paper } from '@mantine/core';

export default function Container({height = '100vh', children, center = true, p = 'md', ...props}) {
  const box = (
    <Paper p={p} {...props}>{children}</Paper>
  );
  return center ? (
    <Center style={{height}}>
      {box}
    </Center>
  ) : box;
}
