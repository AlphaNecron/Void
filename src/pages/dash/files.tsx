import {
  ActionIcon,
  Affix,
  Autocomplete,
  BackgroundImage,
  Button,
  Center,
  Checkbox,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Stack,
  ThemeIcon,
  Tooltip,
  Transition
} from '@mantine/core';
import {useClipboard, useDisclosure, useListState, useWindowScroll} from '@mantine/hooks';
import {useModals} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import CardGrid from 'components/CardGrid';
import FileIndicator from 'components/FileIndicator';
import ItemCard from 'components/ItemCard';
import Upload from 'dialogs/Upload';
import useQuery from 'lib/hooks/useQuery';
import {isType} from 'lib/mime';
import React, {useState} from 'react';
import {FaBomb, FaLock} from 'react-icons/fa';
import {FiClipboard, FiExternalLink, FiSearch, FiTrash, FiUpload} from 'react-icons/fi';
import {ImQrcode} from 'react-icons/im';
import {MdArrowUpward, MdChecklist, MdClearAll, MdDelete} from 'react-icons/md';
import {RiErrorWarningFill} from 'react-icons/ri';
import useSWR from 'swr';

function FileCardInner({handler, items, file, index, ...props}) {
  return (
    <Group spacing={4} {...props}>
      <Checkbox mb={2} mr={1} onChange={e => {
        if (e.target.checked) handler.setItem(index, file.id);
        else handler.remove(index, 1);
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
  const [chunk, setChunk] = useState('40');
  const modals = useModals();
  const [busy, setBusy] = useState(false);
  const [items, handler] = useListState<string>([]);
  const {query, handler: qHandler} = useQuery();
  
  const clipboard = useClipboard({timeout: 500});
  const {
    data,
    mutate
  } = useSWR(`/api/user/files?page=${page}&chunk=${chunk}`, (url: string) => fetch(url).then(res => res.json()));
  const del = (refreshWhenDone = true, notify = true, ...tokens) => {
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
      if (notify) modals.openContextModal('deleted', {
        title: 'Following files have been deleted successfully.',
        innerProps: {
          files: j.deleted
        }
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
    mutate();
  };
  const deleteFiles = (ids: string[]) => {
    const tokens = data.files.filter(f => ids.includes(f.id)).map(f => f.deletionToken);
    if (tokens.length === 0) return;
    del(true, true, ...tokens);
  };
  const [opened, dHandler] = useDisclosure(false);
  const [scroll, scrollTo] = useWindowScroll();
  return data ? (
    <>
      <Upload opened={opened} onClose={dHandler.close} onUpload={mutate}/>
      <Affix zIndex={0} position={{bottom: '2%', right: '2%'}}>
        <Group spacing={4}>
          <Transition transition='slide-up' duration={200} mounted={items.length < data.files?.length}>
            {styles => (
              <ActionIcon style={styles} onClick={() => handler.setState(data.files.map(f => f.id))} color='green'
                variant='light'
                size='lg'>
                <MdChecklist/>
              </ActionIcon>
            )}
          </Transition>
          <Transition transition='slide-right' duration={200} mounted={items.length > 0}>
            {styles => (
              <Group spacing={4} style={styles}>
                <ActionIcon onClick={() => handler.setState([])} color='yellow' variant='light' size='lg'>
                  <MdClearAll/>
                </ActionIcon>
                <ActionIcon onClick={() => deleteFiles(items)} loading={busy} variant='light' size='lg' color='red'>
                  <MdDelete/>
                </ActionIcon>
              </Group>
            )}
          </Transition>
          <Transition mounted={scroll.y > 0} transition='slide-left' duration={200}>
            {styles => (
              <ActionIcon variant='light' color='blue' size='lg' onClick={() => scrollTo({y: 0})} style={styles}>
                <MdArrowUpward/>
              </ActionIcon>
            )}
          </Transition>
        </Group>
      </Affix>
      <Stack>
        <div style={{display: 'flex', position: 'sticky'}}>
          <Button leftIcon={<FiUpload/>} onClick={dHandler.open}>Upload</Button>
          <Autocomplete style={{flex: 1}} mx='xs' icon={<FiSearch/>} placeholder='Search something' value={query}
            onChange={qHandler.set}
            data={(data && data.files) ? Array.from(new Set(data.files?.map(file => file.fileName))) : []}/>
          <Tooltip label='Items per page'>
            <Select style={{width: 72}} data={['20', '40', '80', '100']} value={chunk}
              onChange={setChunk}/>
          </Tooltip>
        </div>
        <CardGrid itemSize={350}>
          {data.files && qHandler.filterList(data.files, ['fileName']).map((file, i) =>
            <ItemCard key={i} title={file.fileName} actions={[
              {
                label: 'Show QR code', color: 'yellow', action: () =>
                  modals.openContextModal('qr', {
                    innerProps: {
                      value: `${window.location.origin}/${file.slug}`
                    }
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
                action: () => del(true, true, file.deletionToken)
              }
            ]}>
              {isType('image', file.mimetype) ? (
                <BackgroundImage src={`/api/file/${file.id}`}>
                  <div style={{height: 125, padding: 8}}>
                    <FileCardInner handler={handler} items={items} index={i} file={file}/>
                  </div>
                </BackgroundImage>
              ) : (
                <Center
                  sx={theme => ({height: 125, background: theme.colors.dark[theme.colorScheme === 'dark' ? 8 : 0]})}>
                  <FileCardInner handler={handler} items={items} index={i} file={file}
                    style={{position: 'absolute', top: 8, left: 8}}/>
                  <FileIndicator size={64} mimetype={file.mimetype}/>
                </Center>
              )}
            </ItemCard>
          )}
        </CardGrid>
      </Stack>
      <Pagination mt='xl' withEdges position='center' page={page} onChange={setPage}
        total={data?.totalPages || 0}/>
    </>
  ) : <LoadingOverlay visible/>;
}

Page_Files.title = 'Files';
Page_Files.authRequired = true;
