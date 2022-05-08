import {
  ActionIcon,
  Autocomplete,
  Center,
  ColorSwatch,
  Group,
  LoadingOverlay,
  RingProgress,
  ScrollArea,
  Stack,
  Table,
  Text,
  Tooltip,
  useMantineTheme
} from '@mantine/core';
import {useSetState} from '@mantine/hooks';
import CardGrid from 'components/CardGrid';
import Console from 'components/Console';
import DashboardCard from 'components/DashboardCard';
import Layout from 'components/Layout';
import useQuery from 'lib/hooks/useQuery';
import {parseByte} from 'lib/utils';
import {Duration} from 'luxon';
import React from 'react';
import {CgSmartphoneRam} from 'react-icons/cg';
import {FiSearch, FiX} from 'react-icons/fi';
import useSWR from 'swr';

export default function Page_Panel() {
  const {query, handler} = useQuery();
  const { colors } = useMantineTheme();
  const { data } = useSWR('/api/admin/stats', (url: string) => fetch(url).then(r => r.json()), { refreshInterval: 4e3, revalidateOnReconnect: true });
  const { data: logs } = useSWR('/api/admin/logs', (url: string) => fetch(url).then(r => r.json()), { refreshInterval: 2e3, revalidateOnReconnect: true });
  const createText = (label: string, value: string) => (
    <Text size='sm' weight={700}>
      {label}: <Text size='sm' style={{ display: 'inline' }} color='violet'>{value}</Text>
    </Text>
  );
  const createLegend = (color: string, description: string) => (
    <Group>
      <ColorSwatch size={16} radius={0} color={color}/>
      <Text>{description}</Text>
    </Group>
  );
  const parseUptime = (raw: number) => {
    const {days, hours, minutes, seconds } = Duration.fromMillis(raw).shiftTo('days', 'hours', 'minutes', 'seconds');
    return `${days}d ${hours}h ${minutes}m ${seconds.toFixed(0)}s`;
  };
  const levelColors = {
    info: 'green',
    debug: 'blue',
    warn: 'yellow',
    error: 'red'
  };
  const colorize = (level: string) => levelColors[level] ?? 'gray';
  return data ? (
    <Layout id={8}>
      <Stack>
        <CardGrid itemSize={350}>
          <DashboardCard title='System'>
            {[
              createText('Manufacturer', data.system.manufacturer),
              createText('BIOS vendor', data.bios.vendor),
              createText('BIOS version', data.bios.version),
              createText('BIOS release date', data.bios.releaseDate),
              createText('Server time', new Date(data.time.current).toLocaleString()),
              createText('Server uptime', parseUptime(data.time.uptime*1e3)),
              createText('Server timezone', data.time.timezone)
            ]}
          </DashboardCard>
          <DashboardCard title='CPU'>
            {[
              createText('Manufacturer', data.cpu.manufacturer),
              createText('Name', data.cpu.brand),
              createText('Speed', `${data.cpu.speed}GHz`),
              createText('Min speed', `${data.cpu.speedMin}GHz`),
              createText('Max speed', `${data.cpu.speedMax}GHz`),
              createText('Governor', data.cpu.governor),
              createText('Cores/Threads', `${data.cpu.physicalCores}C / ${data.cpu.cores}T`)
            ]}
          </DashboardCard>
          <DashboardCard title='Memory'>
            <Group position='apart'>
              <div>
                {[createText('Free', parseByte(data.memory.free)),
                  createText('Used', parseByte(data.memory.used)),
                  createText('Active', parseByte(data.memory.active)),
                  createText('Available', parseByte(data.memory.available)),
                  createText('Buffers', parseByte(data.memory.buffers)),
                  createText('Cached', parseByte(data.memory.cached)),
                  createText('Total', parseByte(data.memory.total))]}
              </div>
              <Tooltip label={
                <Stack spacing={0}>
                  {[['yellow', 'Buffers'], ['grape', 'Cached'], ['blue', 'Active']].map(x => createLegend(colors[x[0]][6], x[1]))}
                </Stack>
              }>
                <RingProgress thickness={4} size={96} roundCaps sections={[
                  { value: data.memory.buffers / data.memory.total * 100, color: 'yellow' },
                  { value: data.memory.cached / data.memory.total * 100, color: 'grape' },
                  { value: data.memory.active / data.memory.total * 100, color: 'blue' }
                ]} label={
                  <Center>
                    <CgSmartphoneRam size={28}/>
                  </Center>
                }/>
              </Tooltip>
            </Group>
          </DashboardCard>
          <DashboardCard title='Operating system'>
            <Group position='apart'>
              <div>
                {[
                  createText('Platform', data.os.platform),
                  createText('Distro', data.os.distro),
                  createText('Release', data.os.release),
                  createText('Codename', data.os.codename),
                  createText('Kernel', `${data.os.kernel} - ${data.os.arch}`),
                  createText('Hostname', data.os.hostname),
                  createText('UEFI', data.os.uefi ? 'Yes' : 'No')
                ]}
              </div>
            </Group>
          </DashboardCard>
        </CardGrid>
        <DashboardCard title='Disks'>
          <ScrollArea scrollbarSize={4}>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Filesystem</th>
                  <th>Mount point</th>
                  <th>Size</th>
                  <th>Physical type</th>
                  <th>UUID</th>
                  <th>Label</th>
                  <th>Model</th>
                  <th>Serial</th>
                  <th>Removable</th>
                  <th>Protocol</th>
                </tr>
              </thead>
              <tbody>
                {data.disks.map((disk, i) => (
                  <tr key={i}>
                    <td>{disk.name}</td>
                    <td>{disk.type}</td>
                    <td>{disk.fsType || <strong>Unknown</strong>}</td>
                    <td>{disk.mount || <strong>Unmounted</strong>}</td>
                    <td>{parseByte(disk.size)}</td>
                    <td>{disk.physical || <strong>Unknown</strong>}</td>
                    <td>{disk.uuid || <strong>Unknown</strong>}</td>
                    <td>{disk.label || <strong>Unset</strong>}</td>
                    <td>{disk.model || <strong>Unknown</strong>}</td>
                    <td>{disk.serial || <strong>Unknown</strong>}</td>
                    <td>{disk.removable ? 'Yes' : 'No'}</td>
                    <td>{disk.protocol || <strong>Unknown</strong>}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </DashboardCard>
        {logs && (
          <DashboardCard title='Logs' rightItem={
            <Autocomplete type='search' rightSection={
              <ActionIcon onClick={() => handler.set('')}>
                <FiX/>
              </ActionIcon>
            } icon={<FiSearch/>} value={query} onChange={handler.set} placeholder='Search something...' data={Array.from(new Set(logs.map(x => x.message)))} size='xs'/>
          }>
            <Console lines={handler.filterList(logs, ['message'])}/>
          </DashboardCard>
        )}
      </Stack>
    </Layout>
  ) : <LoadingOverlay visible/>;
}

Page_Panel.title = 'Log';
Page_Panel.adminOnly = true;
