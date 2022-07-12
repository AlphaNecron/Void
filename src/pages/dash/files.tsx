import {
  ActionIcon,
  Affix,
  Autocomplete,
  BackgroundImage,
  Badge,
  Button,
  Center,
  Checkbox,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Transition
} from '@mantine/core';
import {useClipboard, useDisclosure, useListState, useWindowScroll} from '@mantine/hooks';
import {useModals} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import CardGrid from 'components/CardGrid';
import FileIndicator from 'components/FileIndicator';
import ItemCard from 'components/ItemCard';
import StyledTooltip from 'components/StyledTooltip';
import Upload from 'dialogs/Upload';
import useQuery from 'lib/hooks/useQuery';
import {isType} from 'lib/mime';
import {parseByte} from 'lib/utils';
import {Duration} from 'luxon';
import {useState} from 'react';
import {FaBomb, FaLock} from 'react-icons/fa';
import {FiClipboard, FiExternalLink, FiSearch, FiTrash, FiUpload} from 'react-icons/fi';
import {ImQrcode} from 'react-icons/im';
import {MdArrowUpward, MdChecklist, MdClearAll, MdDelete} from 'react-icons/md';
import {RiDeleteBinFill, RiErrorWarningFill, RiHardDriveFill} from 'react-icons/ri';
import useSWR from 'swr';

function FileCardInner({handler, checked, file, ...props}) {
  return (
    <Group position='apart' {...props}>
      <Group spacing={4}>
        <Checkbox value={file.id} mb={2} mr={1} onChange={handler} checked={checked}/>
        {file.isExploding && (
          <StyledTooltip label='Exploding'>
            <ThemeIcon color='red' size={20}>
              <FaBomb size={12}/>
            </ThemeIcon>
          </StyledTooltip>
        )}
        {file.isPrivate && (
          <StyledTooltip label='Private'>
            <ThemeIcon color='teal' size={20}>
              <FaLock size={12}/>
            </ThemeIcon>
          </StyledTooltip>
        )}
      </Group>
      <Badge px='xs' variant='filled' radius='xs'>
        <Group spacing={4} align='center' position='center'>
          <RiHardDriveFill size={12}/>
          <Text size='xs' weight={700}>
            {parseByte(file.size)}
          </Text>
        </Group>
      </Badge>
    </Group>
  );
}

export default function Page_Files() {
  const [page, setPage] = useState(1);
  const [chunk, setChunk] = useState('30');
  const modals = useModals();
  const [busy, setBusy] = useState(false);
  const {query, handler: qHandler} = useQuery();
  const clipboard = useClipboard({timeout: 500});
  const [items, handler] = useListState<{ id: string, checked: boolean }>([]);
  const selected = items.filter(i => i.checked);
  const {
    data,
    mutate
  } = useSWR(`/api/user/files?page=${page}&chunk=${chunk}`, (url: string) => fetch(url).then(res => res.json()).then(dat => {
    handler.setState(dat?.files.map(f => ({ id: f.id, checked: false })));
    return dat;
  }));
  const del = (tokens: string[]) => {
    setBusy(true);
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
      if (j.deleted.length > 1) {
        modals.openContextModal('deleted', {
          title: 'Following files have been deleted successfully.',
          innerProps: {
            files: j.deleted
          }
        });
      } else showNotification({ title: 'Successfully deleted the file!', message: j.deleted[0].fileName, color: 'green', icon: <RiDeleteBinFill/> });
    }).catch(e => {
      showNotification({
        title: 'Failed to delete the file',
        message: e.toString(),
        color: 'red',
        icon: <RiErrorWarningFill/>
      });
      modals.closeAll();
    }).finally(() => {
      mutate();
      setBusy(false);
    });
  };
  const deleteFiles = (ids: string[]) => {
    const tokens = data.files.filter(f => ids.includes(f.id)).map(f => f.deletionToken);
    if (tokens.length === 0) return;
    del(tokens);
  };
  const [opened, dHandler] = useDisclosure(false);
  const [scroll, scrollTo] = useWindowScroll();
  return data ? (data.error ? (
    <Center style={{ height: '90vh' }}>
      <Stack align='center'>
        <Title order={2}>
          {data.error}
        </Title>
        <Title order={3}>
          Rate limit resets in {Duration.fromMillis(data.nextReset).shiftTo('minutes', 'seconds').toHuman({ maximumFractionDigits: 0})}
        </Title>
      </Stack>
    </Center>
  ) : (
    <>
      <Upload opened={opened} onClose={dHandler.close} onUpload={mutate}/>
      <Affix zIndex={0} position={{bottom: '2%', right: '2%'}}>
        <Group spacing={4}>
          <Transition transition='slide-up' duration={200} mounted={selected.length < data.files.length}>
            {styles => (
              <ActionIcon style={styles} onClick={() => handler.apply(i => ({ checked: true, id: i.id }))} color='green'
                variant='light'
                size='lg'>
                <MdChecklist/>
              </ActionIcon>
            )}
          </Transition>
          <Transition transition='slide-left' duration={200} mounted={selected.length > 0}>
            {styles => (
              <Group spacing={4} style={styles}>
                <ActionIcon onClick={() => handler.apply(i => ({ checked: false, id: i.id }))} color='yellow' variant='light' size='lg'>
                  <MdClearAll/>
                </ActionIcon>
                <ActionIcon onClick={() => deleteFiles(selected.map(s => s.id))} loading={busy} variant='light' size='lg' color='red'>
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
          <StyledTooltip label='Items per page'>
            <Select style={{width: 72}} data={['30', '60', '90']} value={chunk}
              onChange={setChunk}/>
          </StyledTooltip>
        </div>
        <CardGrid itemSize={300}>
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
                action: () => del([file.deletionToken])
              }
            ]}>
              {isType('image', file.mimetype) ? (
                <BackgroundImage src={`/api/file/${file.id}`}>
                  <div style={{height: 125, padding: 8}}>
                    <FileCardInner handler={() => handler.setItemProp(i, 'checked', !items[i].checked)} checked={items[i]?.checked} file={file}/>
                  </div>
                </BackgroundImage>
              ) : (
                <Center
                  sx={theme => ({height: 125, background: theme.colors.dark[theme.colorScheme === 'dark' ? 8 : 0]})}>
                  <FileCardInner handler={() => handler.setItemProp(i, 'checked', !items[i].checked)} checked={items[i]?.checked} file={file}
                    style={{position: 'absolute', top: 8, left: 8, right: 8 }}/>
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
  )) : <LoadingOverlay visible/>;
}

Page_Files.title = 'Files';
Page_Files.authRequired = true;
