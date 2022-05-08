import {
  ActionIcon,
  Affix,
  Autocomplete,
  BackgroundImage,
  Button,
  Center,
  Checkbox,
  Code,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  Transition,
  useMantineTheme
} from '@mantine/core';
import {useClipboard, useListState, useWindowScroll} from '@mantine/hooks';
import {useModals} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import CardGrid from 'components/CardGrid';
import FileIndicator from 'components/FileIndicator';
import ItemCard from 'components/ItemCard';
import Layout from 'components/Layout';
import ThemedQr from 'components/ThemedQr';
import useQuery from 'lib/hooks/useQuery';
import useThemeValue from 'lib/hooks/useThemeValue';
import {isType} from 'lib/mime';
import React, {useState} from 'react';
import {FaBomb, FaLock} from 'react-icons/fa';
import {FiClipboard, FiExternalLink, FiSearch, FiTrash} from 'react-icons/fi';
import {ImQrcode} from 'react-icons/im';
import {MdArrowUpward, MdChecklist, MdClearAll, MdDelete} from 'react-icons/md';
import {RiDeleteBin2Fill, RiErrorWarningFill} from 'react-icons/ri';
import {VscCheckAll, VscChevronUp, VscClearAll, VscTrash} from 'react-icons/vsc';
import useSWR from 'swr';

function FileCardInner({ handler, items, file, index, ...props }) {
  return (
    <Group spacing={4} {...props}>
      <Checkbox mb={2} mr={1} onChange={e => {
        if (e.target.checked) handler.setItem(index, file.id);
        else handler.remove(index, 1);
        console.log(items);
      }} checked={items[index]?.length > 0}/>
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
  const modals = useModals();
  const [busy, setBusy] = useState(false);
  const [items, handler] = useListState<string>([]);
  const { query, handler: qHandler } = useQuery();
  const clipboard = useClipboard({ timeout: 500 });
  const { data, mutate } = useSWR(`/api/user/files?page=${page}&chunk=${chunk}`, (url: string) => fetch(url).then(res => res.json()));
  const deleteFile = (refreshWhenDone = true, notify = true, ...tokens) => {
    setBusy(true);
    handler.setState([]);
    fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tokens)
    }).then(res => res.json()).then(j => {
      if (j.error) {
        setBusy(false);
        return showNotification({
          title: 'Couldn\'t delete the file',
          message: j.error,
          color: 'red',
          icon: <RiErrorWarningFill/>
        });
      }
      if (notify) showNotification({
        title: 'File deleted',
        message: <Text>Deleted file <Code>{JSON.stringify(j.deleted)}</Code>.</Text>,
        color: 'green',
        icon: <RiDeleteBin2Fill/>
      });
      if (refreshWhenDone) mutate();
      setBusy(false);
    }).catch(e => {
      showNotification({
        title: 'Failed to delete the file',
        message: e.toString(),
        color: 'red',
        icon: <RiErrorWarningFill/>
      });
      setBusy(false);
      modals.closeAll();
    });
  };
  const bulkDelete = (ids: string[]) => {
    const tokens = data.files.filter(f => ids.includes(f.id)).map(f => f.deletionToken);
    console.log(tokens);
    if (tokens.length === 0) return;
    deleteFile(true, true, ...tokens);
    mutate();
  };
  const [scroll, scrollTo] = useWindowScroll();
  return data ? (
    <Layout id={1} onReload={mutate}>
      <Affix position={{ bottom: '2%', right: '2%' }}>
        <Group spacing={2}>
          {items.length === data.files.length || (
            <ActionIcon onClick={() => handler.setState(data.files.map(f => f.id))} color='green' variant='light' size='lg'>
              <MdChecklist/>
            </ActionIcon>
          )}
          {(items.length > 0) && (
            <>
              <ActionIcon onClick={() => handler.setState([])} color='yellow' variant='light' size='lg'>
                <MdClearAll/>
              </ActionIcon>
              <ActionIcon onClick={() => bulkDelete(items)} loading={busy} variant='light' size='lg' color='red'>
                <MdDelete/>
              </ActionIcon>
            </>
          )}
          {scroll.y > 0 && (
            <ActionIcon variant='light' color='blue' size='lg' onClick={() => scrollTo({ y: 0 })}>
              <MdArrowUpward/>
            </ActionIcon>
          )}
        </Group>
      </Affix>
      <Stack>
        <div style={{ display: 'flex', position: 'sticky' }}>
          <Autocomplete style={{ flex: 1 }} icon={<FiSearch/>} placeholder='Search something' value={query} onChange={qHandler.set} data={(data && data.files) ? Array.from(new Set(data.files?.map(file => file.fileName))) : []}/>
          <Tooltip label='Item per page'>
            <Select ml='xs' style={{width: 72}} data={['16', '20', '24', '32', '48', '64', '72', '96', '100' ]} value={chunk} onChange={setChunk}/>
          </Tooltip>
        </div>
        <CardGrid itemSize={350}>
          {data.files && qHandler.filterList(data.files, ['fileName']).map((file, i) =>
            <ItemCard key={i} title={file.fileName} actions={[
              {
                label: 'Show QR code', color: 'yellow', action: () =>
                  modals.openModal({
                    withCloseButton: true,
                    overlayBlur: 4,
                    children: (
                      <Stack align='center'>
                        <ThemedQr removeQrCodeBehindLogo logoImage='/logo.png' quietZone={16} qrStyle='dots' eyeRadius={8} value={`${window.location.origin}/${file.slug}`} size={288}/>
                        <Text color='dimmed'>Scan this QR code on your device to view the file.</Text>
                      </Stack>
                    )
                  }), icon: <ImQrcode/>
              }, {
                label: 'Open in new tab',
                color: 'blue',
                icon: <FiExternalLink/>,
                action: () => window?.open(`/${file.slug}`, '_blank')
              }, {
                label: 'Copy to clipboard',
                color: 'green',
                icon: <FiClipboard/>,
                action: () => clipboard.copy(`${window.location.origin}/${file.slug}`)
              }, {
                label: 'Delete',
                busy,
                color: 'red',
                icon: <FiTrash/>,
                action: () => deleteFile(true, true, file.deletionToken)
              }
            ]}>
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
            </ItemCard>
          )}
        </CardGrid>
      </Stack>
      <Pagination mt='xl' withEdges position='center' page={page} onChange={setPage} total={(data && data.totalPages) || 0} />
    </Layout>
  ) : <LoadingOverlay visible/>;
}

Page_Files.title = 'Files';
Page_Files.authRequired = true;
