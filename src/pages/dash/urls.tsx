import Layout from 'components/Layout';
import React from 'react';
import {Permission} from 'lib/permission';
import useSWR from 'swr';
import {ActionIcon, Anchor, Card, CardSection, Group, SimpleGrid, Title, Tooltip} from '@mantine/core';
import {BiClipboard, BiLinkExternal, BiTrash} from 'react-icons/bi';
import {useClipboard} from '@mantine/hooks';

export default function Page_URLs() {
  const { data, mutate } = useSWR('/api/user/urls', (url: string) => fetch(url).then(r => r.json()));
  const clipboard = useClipboard();
  return (
    <Layout onReload={() => mutate()} id={4}>
      <SimpleGrid cols={1} breakpoints={[
        { minWidth: 6*300-16, cols: 5 },
        { minWidth: 5*300-16, cols: 4 },
        { minWidth: 4*300-16, cols: 3 },
        { minWidth: 3*300-16, cols: 2 },
        { minWidth: 2*300-16, cols: 1 }
      ]}>
        {data && data.map((x, i) =>
          <Card key={i}>
            <CardSection p='sm'>
              <Title order={6}>ID: {x.id}</Title>
              <Title order={6}>Created at: {new Date(x.createdAt).toLocaleString()}</Title>
              <Title order={6}>Destination: <Anchor href={x.destination}>
                {x.destination}
              </Anchor>
              </Title>
              <Title order={6}>Views: {x.views}</Title>
              <Title order={6}>Has password: {x.password ? 'Yes' : 'No'}</Title>
            </CardSection>
            <Group spacing={0} mr={-6} mb={-10} position='right'>
              <Tooltip label='Open in new tab'>
                <ActionIcon color='blue' component='a' target='_blank' href={`/${x.short}`}>
                  <BiLinkExternal/>
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Copy URL' onClick={() => clipboard.copy(`${window.location.origin}/${x.short}`)}>
                <ActionIcon color='green'>
                  <BiClipboard/>
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Delete'>
                <ActionIcon color='red'>
                  <BiTrash/>
                </ActionIcon>
              </Tooltip>
            </Group>
          </Card>
        )}
      </SimpleGrid>
    </Layout>
  );
}

Page_URLs.title = 'URLs';
Page_URLs.permission = Permission.SHORTEN;
