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
  useMantineTheme
} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import Console from 'components/Console';
import DashboardCard from 'components/DashboardCard';
import StyledTooltip from 'components/StyledTooltip';
import TextPair from 'components/TextPair';
import useQuery from 'lib/hooks/useQuery';
import {parseByte} from 'lib/utils';
import {Duration} from 'luxon';
import React from 'react';
import {CgSmartphoneRam} from 'react-icons/cg';
import {FaMemory} from 'react-icons/fa';
import {FiSearch, FiX} from 'react-icons/fi';
import {IoMdListBox} from 'react-icons/io';
import {MdDesktopWindows, MdMemory, MdStorage} from 'react-icons/md';
import {VscTerminalLinux} from 'react-icons/vsc';
import useSWR from 'swr';

export default function Page_Panel() {
  const {query, handler} = useQuery();
  const {colors, colorScheme} = useMantineTheme();
  const {data} = useSWR('/api/admin/stats', (url: string) => fetch(url).then(r => r.json()), {
    refreshInterval: 4e3,
    revalidateOnReconnect: true
  });
  const {data: logs} = useSWR('/api/admin/logs', (url: string) => fetch(url).then(r => r.json()), {
    refreshInterval: 2e3,
    revalidateOnReconnect: true
  });
  const createText = (label: string, value: string) => (
    <Text size='sm' weight={700} color='dimmed'>
      {label}: <Text size='sm' style={{display: 'inline'}}
        color={colorScheme === 'dark' ? 'white' : 'dark'}>{value}</Text>
    </Text>
  );
  const createLegend = (color: string, description: string) => (
    <Group>
      <ColorSwatch size={16} radius={0} color={color}/>
      <Text>{description}</Text>
    </Group>
  );
  const parseUptime = (raw: number) => {
    const {days, hours, minutes, seconds} = Duration.fromMillis(raw).shiftTo('days', 'hours', 'minutes', 'seconds');
    return `${days}d ${hours}h ${minutes}m ${seconds.toFixed(0)}s`;
  };
  return data ? (
    <Stack>
      <CardGrid itemSize={350}>
        <DashboardCard title='System' icon={<MdDesktopWindows/>}>
          {[
            createText('Manufacturer', data.system.manufacturer),
            createText('BIOS vendor', data.bios.vendor),
            createText('BIOS version', data.bios.version),
            createText('BIOS release date', data.bios.releaseDate),
            createText('Current time', new Date(data.time.current).toLocaleString()),
            createText('Uptime', parseUptime(data.time.uptime * 1e3)),
            createText('Timezone', data.time.timezone)
          ]}
        </DashboardCard>
        <DashboardCard title='CPU' icon={<MdMemory/>}>
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
        <DashboardCard title='Memory' icon={<FaMemory/>}>
          <Group position='apart'>
            <div>
              {[
                ['Free', parseByte(data.memory.free)],
                ['Used', parseByte(data.memory.used)],
                ['Active', parseByte(data.memory.active)],
                ['Available', parseByte(data.memory.available)],
                ['Buffers', parseByte(data.memory.buffers)],
                ['Cached', parseByte(data.memory.cached)],
                ['Total', parseByte(data.memory.total)]
              ].map(([x, y]) => <TextPair label={x} value={y} key={x}/>)}
            </div>
            <StyledTooltip label={
              <Stack spacing={0}>
                {[['yellow', 'Buffers'], ['grape', 'Cached'], ['blue', 'Active']].map(x => createLegend(colors[x[0]][6], x[1]))}
              </Stack>
            }>
              <RingProgress thickness={4} size={96} roundCaps sections={[
                {value: data.memory.buffers / data.memory.total * 100, color: 'yellow'},
                {value: data.memory.cached / data.memory.total * 100, color: 'grape'},
                {value: data.memory.active / data.memory.total * 100, color: 'blue'}
              ]} label={
                <Center>
                  <CgSmartphoneRam size={28}/>
                </Center>
              }/>
            </StyledTooltip>
          </Group>
        </DashboardCard>
        <DashboardCard title='Operating system' icon={<VscTerminalLinux/>}>
          <Group position='apart'>
            <div>
              {[
                ['Platform', data.os.platform],
                ['Distro', data.os.distro],
                ['Release', data.os.release],
                ['Codename', data.os.codename],
                ['Kernel', `${data.os.kernel} - ${data.os.arch}`],
                ['Hostname', data.os.hostname],
                ['UEFI', data.os.uefi ? 'Yes' : 'No']
              ].map(([x, y]) => <TextPair label={x} value={y} key={x}/>)}
            </div>
          </Group>
        </DashboardCard>
      </CardGrid>
      <DashboardCard title='Disks' icon={<MdStorage/>}>
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
                  <td>{disk.fsType}</td>
                  <td>{disk.mount}</td>
                  <td>{parseByte(disk.size)}</td>
                  <td>{disk.physical}</td>
                  <td>{disk.uuid}</td>
                  <td>{disk.label}</td>
                  <td>{disk.model}</td>
                  <td>{disk.serial}</td>
                  <td>{disk.removable ? 'Yes' : 'No'}</td>
                  <td>{disk.protocol}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </DashboardCard>
      {logs && (
        <DashboardCard icon={<IoMdListBox/>} title='Logs' rightItem={
          <Autocomplete type='search' rightSection={
            <ActionIcon onClick={() => handler.set('')}>
              <FiX/>
            </ActionIcon>
          } icon={<FiSearch/>} value={query} onChange={handler.set} placeholder='Search something...'
          data={Array.from(new Set(logs.map(x => x.message)))} size='xs'/>
        }>
          <Console lines={handler.filterList(logs, ['message'])}/>
        </DashboardCard>
      )}
    </Stack>
  ) : <LoadingOverlay visible/>;
}

Page_Panel.title = 'Panel';
Page_Panel.adminOnly = true;
