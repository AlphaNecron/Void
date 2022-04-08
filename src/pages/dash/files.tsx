import {
  ActionIcon,
  Affix,
  Autocomplete,
  BackgroundImage,
  Card,
  Center,
  Checkbox,
  Group,
  Pagination,
  Popover,
  Select,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Transition
} from '@mantine/core';
import {useClipboard, useDebouncedValue, useListState, useWindowScroll} from '@mantine/hooks';
import {showNotification} from '@mantine/notifications';
import {ScrollArea} from '@radix-ui/react-scroll-area';
import FileIndicator from 'components/FileIndicator';
import Layout from 'components/Layout';
import {isType} from 'lib/mime';
import {QRCodeSVG} from 'qrcode.react';
import React, {useState} from 'react';
import {FaBomb, FaLock} from 'react-icons/fa';
import {FiClipboard, FiExternalLink, FiSearch, FiTrash} from 'react-icons/fi';
import {ImQrcode} from 'react-icons/im';
import {RiDeleteBin2Fill, RiErrorWarningFill} from 'react-icons/ri';
import {VscCheckAll, VscChevronUp, VscClearAll, VscTrash} from 'react-icons/vsc';
import useSWR from 'swr';

function FileCardInner({ handler, items, file, index, ...props }) {
  return (
    <Group spacing={4} {...props}>
      <Checkbox mb={2} mr={1} onChange={e => handler.setItem(index, { id: file.id, selected: e.target.checked })} checked={items[index]?.selected}/>
      {file.isExploding && (
        <Tooltip label='Exploding'>
          <ThemeIcon color='red' size={20}>
            <FaBomb size={12}/>
          </ThemeIcon>
        </Tooltip>
      )}
      {file.isPrivate && (
        <Tooltip label='Private'>
          <ThemeIcon color='teal' size={20}>
            <FaLock size={12}/>
          </ThemeIcon>
        </Tooltip>
      )}
    </Group>
  );
}

export default function Page_Files() {
  const [page, setPage] = useState(1);
  const [chunk, setChunk] = useState('12');
  const [pop, setPop] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [items, handler] = useListState<{ id: string, selected: boolean}>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 250);
  const clipboard = useClipboard({ timeout: 500 });
  const { data, mutate } = useSWR(`/api/user/files?page=${page}&chunk=${chunk}`, (url: string) => fetch(url).then(res => res.json()));
  const deleteFile = (token: string, fileName: string, refreshWhenDone: boolean = true, notify: boolean = true) => {
    setBusy(true);
    fetch(`/api/delete?token=${token}`).then(res => res.json()).then(j => {
      if (j.error) return showNotification({
        title: 'Couldn\'t delete the file',
        message: j.error,
        color: 'red',
        icon: <RiErrorWarningFill/>
      });
      if (notify) showNotification({
        title: 'File deleted',
        message: `Deleted file ${fileName}.`,
        color: 'green',
        icon: <RiDeleteBin2Fill/>
      });
      if (refreshWhenDone) refresh();
      setBusy(false);
    }).catch(e => { showNotification({
      title: 'Failed to delete the file',
      message: e.toString(),
      color: 'red',
      icon: <RiErrorWarningFill/>
    });
    setBusy(false);
    setPop(-1);
    });
  };
  const bulkDelete = (ids: string[]) => {
    const fn = [];
    for (const id of ids) {
      const { deletionToken, fileName } = data.files.find(f => f.id === id);
      if (!deletionToken) return;
      deleteFile(deletionToken, fileName, false, false);
      fn.push(fileName);
    }
    handler.setState([]);
    showNotification({ title: 'Files deleted', message:
          <ScrollArea style={{ maxHeight: 150 }}>
            {fn.map((f, i) => <Text key={i}>{f}</Text>)}
          </ScrollArea>, color: 'green', icon: <RiDeleteBin2Fill/>
    });
    refresh();
  };
  const [scroll, scrollTo] = useWindowScroll();
  const refresh = () => mutate(`/api/user/files?page=${page}&chunk=${chunk}`);
  return (
    <Layout id={1} onReload={refresh} searchBar={
      <Autocomplete style={{ minWidth: '25%' }} icon={<FiSearch/>} placeholder='Search something' value={query} onChange={setQuery} data={(data && data.files) ? data.files?.map(file => file.fileName) : []}/>
    } rightChildren={
      <Tooltip label='Item per page'>
        <Select style={{width: 72}} data={['4', '8', '12', '16', '20', '24', '32', '48', '64', '72', '96', '100' ]} value={chunk} onChange={setChunk}/>
      </Tooltip>
    }>
      <Affix position={{ bottom: '2%', right: '2%' }}>
        <Transition transition='slide-up' duration={200} mounted={items.filter(x => x?.selected).length > 0 || scroll.y > 0}>
          {styles => (
            <Group style={styles} spacing={2}>
              {(items.filter(x => x?.selected).length > 0) && (
                <>
                  <Tooltip label='Select all'>
                    <ActionIcon onClick={() => handler.setState(data.files.map(f => ({ id: f.id, selected: true })))} color='green' variant='filled' size='lg'>
                      <VscCheckAll/>
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Deselect all'>
                    <ActionIcon onClick={() => handler.setState([])} color='yellow' variant='filled' size='lg'>
                      <VscClearAll/>
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Delete selected'>
                    <ActionIcon onClick={() => bulkDelete(items.filter(x => x?.selected).map(x => x.id))} loading={busy} variant='filled' size='lg' color='red'>
                      <VscTrash/>
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
              {scroll.y > 0 && (
                <Tooltip label='Scroll to top'>
                  <ActionIcon variant='filled' size='lg' color='blue' onClick={() => scrollTo({ y: 0 })}>
                    <VscChevronUp/>
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          )}
        </Transition>
      </Affix>
      <SimpleGrid cols={1} breakpoints={[
        { minWidth: 6*300+16, cols: 5 },
        { minWidth: 5*300+16, cols: 4 },
        { minWidth: 4*300+16, cols: 3 },
        { minWidth: 3*300+40, cols: 2 },
        { minWidth: 2*300+16, cols: 1 }
      ]}>
        {(data && data.files) && (data.files.filter(x => x.fileName.toLowerCase().includes(debouncedQuery.toLowerCase())).map((file, i) =>
          <Card shadow='xl' key={i} withBorder>
            <Card.Section>
              {isType('image', file.mimetype) ? (
                <BackgroundImage src={`/api/file/${file.id}`}>
                  <div style={{ height: 125, padding: 8 }}>
                    <FileCardInner handler={handler} items={items} index={i} file={file}/>
                  </div>
                </BackgroundImage>
              ) : (
                <Center sx={theme => ({ height: 125, background: theme.colors.dark[theme.colorScheme === 'dark' ? 8 : 0] })}>
                  <FileCardInner handler={handler} items={items} index={i} file={file} style={{ position: 'absolute', top: 8, left: 8 }}/>
                  <FileIndicator size={64} mimetype={file.mimetype}/>
                </Center>
              )}
            </Card.Section>
            <Group mb={-12} mr={-8} ml={-4} mt={4} position='apart'>
              <Title style={{ maxWidth: '53%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} order={6}>{file.fileName}</Title>
              <Group spacing={0}>
                <Popover opened={pop === i} closeOnClickOutside closeOnEscape onClose={() => setPop(-1)} target={
                  <Tooltip label='Show QR code'>
                    <ActionIcon color='yellow' onClick={() => setPop(p => p === i ? -1 : i)}>
                      <ImQrcode/>
                    </ActionIcon>
                  </Tooltip>
                }>
                  <QRCodeSVG level='Q' value={`${window.location.origin}/${file.slug}`}/>
                </Popover>
                <Tooltip label='Open in new tab'>
                  <ActionIcon color='blue' component='a' href={`/${file.slug}`} target='_blank'>
                    <FiExternalLink/>
                  </ActionIcon>
                </Tooltip>
                <Tooltip label='Copy URL'>
                  <ActionIcon color='green' onClick={() => clipboard.copy(`${window.location.origin}/${file.slug}`)}>
                    <FiClipboard/>
                  </ActionIcon>
                </Tooltip>
                <Tooltip label='Delete'>
                  <ActionIcon loading={busy} color='red' onClick={() => deleteFile(file.deletionToken, file.fileName)}>
                    <FiTrash/>
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
      <Pagination mt='xl' withEdges position='center' page={page} onChange={setPage} total={(data && data.totalPages) || 0} />
    </Layout>
  );
}

Page_Files.title = 'Files';
Page_Files.authRequired = true;
