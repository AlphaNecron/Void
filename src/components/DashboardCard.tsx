import {Card, Group, Text} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';
import React from 'react';

export default function DashboardCard({ title, children, rightItem = null, icon = null, ...props }) {
  const { value } = useThemeValue();
  return (
    <Card radius='md' sx={theme => ({ position: 'relative', border: `solid 2px ${value(theme.fn.lighten(theme.colors.dark[1], 0.5), theme.colors.dark[5])}` })} {...props}>
      <Card.Section>
        <Group position='apart' mr='md' spacing={0}>
          <Group align='center' ml='sm' spacing='xs' my={6} >
            {icon}
            <Text size='sm' weight={700} color='dimmed'>
              {title}
            </Text>
          </Group>
          {rightItem}
        </Group>
      </Card.Section>
      {children}
    </Card>
  );
}
