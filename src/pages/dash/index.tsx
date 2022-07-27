import {LoadingOverlay, ScrollArea, Table, Text} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import DashboardCard from 'components/DashboardCard';
import Fallback from 'components/Fallback';
import StatCard from 'components/StatCard';
import useFetch from 'lib/hooks/useFetch';
import {prettyBytes} from 'lib/utils';
import {FiFile, FiGlobe, FiHardDrive, FiLink2, FiStar, FiUser, FiUsers} from 'react-icons/fi';

function Atd({ children, ...props }) {
  return <td {...props}>{children || <Text weight={700} color='dimmed' size='xs'>Unset</Text>}</td>;
}

export default function Page_Dashboard() {
  const { data } = useFetch('/api/stats');
  return (
    <Fallback loaded={data}>
      {() => (
        <>
          <CardGrid itemSize={180}>
            <StatCard title='Total size' icon={<FiHardDrive size={14}/>} value={prettyBytes(data.stats.upload.totalSize || 0)} alt={`${prettyBytes(data.stats.upload.averageSize || 0)} on average.`}/>
            <StatCard title='Files' icon={<FiFile size={14}/>} value={data.stats.upload.totalFiles} alt={`You own ${data.stats.user.files} files.`}/>
            <StatCard title='Users' value={data.stats.users.count} icon={<FiUser size={14}/>}/>
            <StatCard title='URLs' icon={<FiLink2 size={14}/>} value={data.stats.urls} alt={`You have ${data.stats.user.urls} URLs.`}/>
            <StatCard title='Domains' icon={<FiGlobe/>} value={data.stats.domainCount}/>
            <StatCard title='Roles' icon={<FiUsers size={14}/>} value={data.stats.roleCount}/>
          </CardGrid>
          {data.stats.users.top && (
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
                    {data.stats.users.top.map((user, i) =>
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
      )}
    </Fallback>
  );
}

Page_Dashboard.title = 'Dashboard';
Page_Dashboard.authRequired = true;
