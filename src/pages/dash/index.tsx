import {LoadingOverlay, ScrollArea, Table, Text} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import DashboardCard from 'components/DashboardCard';
import StatCard from 'components/StatCard';
import {parseByte} from 'lib/utils';
import React from 'react';
import {FiFile, FiHardDrive, FiLink2, FiStar, FiUser} from 'react-icons/fi';
import useSWR from 'swr';

function Atd({ children, ...props }) {
  return <td {...props}>{children || <Text weight={700} color='dimmed' size='xs'>Unset</Text>}</td>;
}

export default function Page_Dashboard() {
  const { data } = useSWR('/api/stats', (url: string) => fetch(url).then(r => r.json()));
  if (data) {
    const { stats } = data;
    return (
      <>
        <CardGrid itemSize={180}>
          <StatCard title='Total size' icon={<FiHardDrive size={14}/>} value={parseByte(stats.upload.totalSize)} alt={`${parseByte(stats.upload.averageSize)} on average.`}/>
          <StatCard title='Total files' icon={<FiFile size={14}/>} value={stats.upload.totalFiles} alt={`You own ${stats.user.files} files.`}/>
          <StatCard title='Total users' value={stats.users.count} icon={<FiUser size={14}/>}/>
          <StatCard title='Total URLs' icon={<FiLink2 size={14}/>} value={stats.urls} alt={`You have ${stats.user.urls} URLs.`}/>
          <StatCard title='Total URLs' icon={<FiLink2 size={14}/>} value={stats.urls} alt={`You have ${stats.user.urls} URLs.`}/>
          <StatCard title='Total URLs' icon={<FiLink2 size={14}/>} value={stats.urls} alt={`You have ${stats.user.urls} URLs.`}/>
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
