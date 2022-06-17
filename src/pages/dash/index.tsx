import {LoadingOverlay, ScrollArea, Table, Text} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import DashboardCard from 'components/DashboardCard';
import StatCard from 'components/StatCard';
import React from 'react';
import {FiFile, FiLink2, FiStar, FiUser} from 'react-icons/fi';
import useSWR from 'swr';

function Atd({ children, ...props }) {
  return <td {...props}>{children || <Text weight={700} color='dimmed' size='xs'>Unset</Text>}</td>;
}

export default function Page_Dashboard() {
  const { data } = useSWR('/api/stats', (url: string) => fetch(url).then(r => r.json()));
  if (data) {
    const { user, stats } = data;
    return (
      <>
        <CardGrid itemSize={250}>
          <StatCard title='Total files' icon={<FiFile size={14}/>} value={stats.upload.totalFiles} alt={`You have uploaded ${stats.user.files} files in total.`}/>
          {/*<DashboardCard title='User storage'>*/}
          {/*  <Group mt='sm' position='apart'>*/}
          {/*    <Stack spacing={0}>*/}
          {/*      {[createText('Role', userQuota.role, 'void'), createText('Used', parseByte(userQuota.quota.used)),*/}
          {/*        createText('Remaining', userQuota.bypass ? 'Unlimited' : parseByte(data.userQuota.quota.remaining)), createText('Total', userQuota.bypass ? 'Unlimited' : parseByte(userQuota.total))]*/}
          {/*      }*/}
          {/*    </Stack>*/}
          {/*    <RingProgress*/}
          {/*      size={84}*/}
          {/*      thickness={4}*/}
          {/*      roundCaps*/}
          {/*      label={*/}
          {/*        <Center>*/}
          {/*          <FiHardDrive size={24}/>*/}
          {/*        </Center>*/}
          {/*      }*/}
          {/*      sections={[(percent => ({*/}
          {/*        value: percent,*/}
          {/*        color: percent >= 90 ? 'red' : percent >= 50 ? 'yellow' : 'green'*/}
          {/*      }))(userQuota.bypass ? 0 : userQuota.used / userQuota.total * 100)]}/>*/}
          {/*  </Group>*/}
          {/*</DashboardCard>*/}
          {/*<DashboardCard title='Upload statistics'>*/}
          {/*  <Group position='apart' mr='xl' align='center' mt='xl'>*/}
          {/*    <Stack spacing={0}>*/}
          {/*      {[createText('Total size', parseByte(uploadStats.totalSize)), createText('Total files', uploadStats.totalFiles), createText('Average size', parseByte(uploadStats.averageSize))]}*/}
          {/*    </Stack>*/}
          {/*    <FiFile size={24}/>*/}
          {/*  </Group>*/}
          {/*</DashboardCard>*/}
          <StatCard title='Total users' value={stats.users.count} icon={<FiUser size={14}/>}/>
          <StatCard title='Total URLs' icon={<FiLink2 size={14}/>} value={stats.urls} alt={`You have shortened ${stats.user.urls} URLs in total.`}/>
        </CardGrid>
        {stats.users.top && (
          <DashboardCard icon={<FiStar size={14}/>} mt='md' title='Top 10 users' size={0}>
            <ScrollArea scrollbarSize={4}>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Username</th>
                    <th>Display name</th>
                    <th>Files</th>
                    <th>URLs</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.top.map((user, i) =>
                    <tr key={i}>
                      <td>{i}</td>
                      <Atd>{user.username}</Atd>
                      <Atd>{user.displayName}</Atd>
                      <td>{user.files}</td>
                      <td>{user.urls}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollArea>
          </DashboardCard>
        )}
      </>
    );
  }
  else return <LoadingOverlay visible={true}/>;
}

Page_Dashboard.title = 'Dashboard';
Page_Dashboard.authRequired = 'true';
