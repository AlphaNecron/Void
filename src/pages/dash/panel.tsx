import {
  ActionIcon,
  Center,
  ColorSwatch,
  Group,
  HoverCard,
  RingProgress,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  useMantineTheme
} from '@mantine/core';
import CardGrid from 'components/CardGrid';
import Console from 'components/Console';
import DashboardCard from 'components/DashboardCard';
import Fallback from 'components/Fallback';
import TextPair from 'components/TextPair';
import useFetch from 'lib/hooks/useFetch';
import useQuery from 'lib/hooks/useQuery';
import {LogEntry} from 'lib/types';
import {prettyBytes} from 'lib/utils';
import prettyMilliseconds from 'pretty-ms';
import {CgSmartphoneRam} from 'react-icons/cg';
import {FaMemory} from 'react-icons/fa';
import {FiSearch, FiX} from 'react-icons/fi';
import {IoMdListBox} from 'react-icons/io';
import {MdDesktopWindows, MdMemory, MdStorage} from 'react-icons/md';
import {VscTerminalLinux} from 'react-icons/vsc';

export default function Page_Panel() {
  const {query, handler} = useQuery();
  const {colors} = useMantineTheme();
  const {data} = useFetch('/api/admin/stats', {
    refreshInterval: 10e3
  });
  const {data: logs} = useFetch<LogEntry[]>('/api/admin/logs', {
    refreshInterval: 5e3,
    fallbackData: []
  });
  const render = (...pairs: string[][]) => pairs.map(([x, y]) => <TextPair label={x} value={y} key={x} />);
  const createLegend = (color: string, description: string) => (
    <Group key={description}>
      <ColorSwatch size={12} radius={0} color={color} />
      <Text weight={600} size='xs' color='dimmed'>{description}</Text>
    </Group>
  );
  return (
    <Fallback loaded={data}>
      {() => (
        <Stack>
          <CardGrid itemSize={300}>
            <DashboardCard title='System' icon={<MdDesktopWindows />}>
              {render(
                ['Manufacturer', data.system.manufacturer],
                ['BIOS vendor', data.bios.vendor],
                ['BIOS version', data.bios.version],
                ['BIOS release date', data.bios.releaseDate],
                ['Current time', new Date(data.time.current).toLocaleString()],
                ['Uptime', prettyMilliseconds(data.time.uptime * 1e3, {verbose: true, secondsDecimalDigits: 0})],
                ['Timezone', data.time.timezone]
              )}
            </DashboardCard>
            <DashboardCard title='CPU' icon={<MdMemory />}>
              {render(
                ['Manufacturer', data.cpu.manufacturer],
                ['Name', data.cpu.brand],
                ['Speed', `${data.cpu.speed}GHz`],
                ['Min speed', `${data.cpu.speedMin}GHz`],
                ['Max speed', `${data.cpu.speedMax}GHz`],
                ['Governor', data.cpu.governor],
                ['Cores/Threads', `${data.cpu.physicalCores}C / ${data.cpu.cores}T`]
              )}
            </DashboardCard>
            <DashboardCard title='Memory' icon={<FaMemory />}>
              <Group position='apart'>
                <div>
                  {render(
                    ['Free', prettyBytes(data.memory.free)],
                    ['Used', prettyBytes(data.memory.used)],
                    ['Active', prettyBytes(data.memory.active)],
                    ['Available', prettyBytes(data.memory.available)],
                    ['Buffers', prettyBytes(data.memory.buffers)],
                    ['Cached', prettyBytes(data.memory.cached)],
                    ['Total', prettyBytes(data.memory.total)]
                  )}
                </div>
                <HoverCard position='left' withArrow>
                  <HoverCard.Target>
                    <RingProgress thickness={4} size={96} roundCaps sections={[
                      {value: data.memory.buffers / data.memory.total * 100, color: 'yellow'},
                      {value: data.memory.cached / data.memory.total * 100, color: 'grape'},
                      {value: data.memory.active / data.memory.total * 100, color: 'blue'}
                    ]} label={
                      <Center>
                        <CgSmartphoneRam size={28} />
                      </Center>
                    } />
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Stack spacing={0}>
                      {[['yellow', 'Buffers'], ['grape', 'Cached'], ['blue', 'Active']].map(x => createLegend(colors[x[0]][6], x[1]))}
                    </Stack>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Group>
            </DashboardCard>
            <DashboardCard title='Operating system' icon={<VscTerminalLinux />}>
              <Group position='apart'>
                <div>
                  {render(
                    ['Platform', data.os.platform],
                    ['Distro', data.os.distro],
                    ['Release', data.os.release],
                    ['Codename', data.os.codename],
                    ['Kernel', `${data.os.kernel} - ${data.os.arch}`],
                    ['Hostname', data.os.hostname],
                    ['UEFI', data.os.uefi ? 'Enabled' : 'Disabled']
                  )}
                </div>
              </Group>
            </DashboardCard>
          </CardGrid>
          <DashboardCard title='Disks' icon={<MdStorage />}>
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
                      <td>{prettyBytes(disk.size)}</td>
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
            <DashboardCard icon={<IoMdListBox />} title='Logs' rightItem={
              <TextInput variant='unstyled' type='search' style={{minWidth: 250}} ml='md' rightSection={
                <ActionIcon onClick={() => handler.set('')}>
                  <FiX />
                </ActionIcon>
              } icon={<FiSearch />} value={query} onChange={({currentTarget: {value}}) => handler.set(value)}
              placeholder='Search something...'
              size='xs' />
            }>
              <Console mt='xs' entries={handler.filterList(logs, ['message'])} />
            </DashboardCard>
          )}
        </Stack>
      )}
    </Fallback>
  );
}

Page_Panel.title = 'Panel';
Page_Panel.adminOnly = true;
