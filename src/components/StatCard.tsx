import {Stack, Text, Title} from '@mantine/core';
import DashboardCard from 'components/DashboardCard';
import React from 'react';

export default function StatCard({title, value, alt = '', ...props}) {
  return (
    <DashboardCard title={title} {...props}>
      <Stack spacing={0} mb='-xs'>
        <Title order={2}>{value}</Title>
        <Text weight={700} size='xs' color='void'>{alt}</Text>
      </Stack>
    </DashboardCard>
  );
}
