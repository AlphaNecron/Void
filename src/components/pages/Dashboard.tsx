import { SimpleGrid, Skeleton } from '@chakra-ui/react';
import List from 'components/List';
import StatCard from 'components/StatCard';
import useFetch from 'lib/hooks/useFetch';
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const loadStats = async () => {
    setBusy(true);
    const stts = await useFetch('/api/stats');
    setStats(stts);
    setBusy(false);
  };
  useEffect(() => { loadStats(); }, []);
  return (
    <>
      <Skeleton m={2} isLoaded={!busy && stats} minHeight={16}>
        {stats && (
          <SimpleGrid mx={2} gap={4} minChildWidth='150px' columns={[2, 3, 3]}>
            <StatCard name='Size' value={stats.size}/>
            <StatCard name='Average size' value={stats.avgSize}/>
            <StatCard name='Files' value={stats.fileCount}/>
            <StatCard name='URLs' value={stats.urlCount}/>
            <StatCard name='Views' value={stats.viewCount}/>
            <StatCard name='Users' value={stats.userCount}/>
          </SimpleGrid>
        )}
      </Skeleton>
      <Skeleton isLoaded={!busy && stats} m={2} minHeight={20}>
        {(stats && stats.countByType && stats.countByUser) && (
          <List types={stats.countByType} users={stats.countByUser}/>
        )}
      </Skeleton>
    </>
  );
}