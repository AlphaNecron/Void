import { Card, Group, Text } from '@mantine/core';

export default function DashboardCard({title, children, rightItem = null, icon = null, ...props}) {
  return (
    <Card radius='md' {...props}>
      <Card.Section>
        <Group position='apart' mr='md' spacing={0}>
          <Group align='center' ml='sm' spacing='xs' my={6}>
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
