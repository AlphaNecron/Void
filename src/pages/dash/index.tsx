import {Card, Center, Divider, RingProgress, Text, Title} from '@mantine/core';
import Layout from 'components/Layout';
import {parseByte} from 'lib/utils';
import React from 'react';
import useSWR from 'swr';

export default function Page_Dashboard() {
  const { data, error, mutate } = useSWR('/api/upload', (url: string) => fetch(url).then(r => r.json()));
  const createText = (label: string, value: string, color: string) => (
    <Text size='md' weight={600} style={{ display: 'block' }}>
      {label}: <Text size='md' style={{ display: 'inline' }} color={color}>{value}</Text>
    </Text>
  );
  return (
    <Layout id={0}>
      {(data && data.quota) && (
        <Card sx={theme => ({ width: 350, border: `1.5px solid ${theme.colors.dark[3]}` })}>
          <Card.Section>
            <Title align='center' order={5} my={6}>User storage</Title>
            <Divider/>
          </Card.Section>
          <Center mt='sm' style={{ display: 'flex' }}>
            <RingProgress
              size={100}
              thickness={8}
              roundCaps
              mr='xl'
              sections={[(percent => ({ value: percent, color: percent >= 90 ? 'red' : percent >= 50 ? 'yellow' : 'green' }))(data.bypass ? 0 : data.quota.used / data.quota.total * 100)]}/>
            <div>
              {[createText('Role', data.quota.role, 'red'), createText('Used', parseByte(data.quota.used), 'blue'),
                createText('Remaining', data.bypass ? 'Unlimited' : parseByte(data.quota.remaining), 'green'), createText('Total', data.bypass ? 'Unlimited' : parseByte(data.quota.total), 'orange')].map((x, i) => x)
              }
            </div>
          </Center>
        </Card>
      )}
    </Layout>
  );
}

Page_Dashboard.title = 'Dashboard';
Page_Dashboard.authRequired = 'true';
