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
  Pagination,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Transition
} from '@mantine/core';
import {useDisclosure, useWindowScroll} from '@mantine/hooks';
import {openConfirmModal, openContextModal, openModal} from '@mantine/modals';
import CardGrid from 'components/CardGrid';
import Fallback from 'components/Fallback';
import FileIndicator from 'components/FileIndicator';
import ItemCard from 'components/ItemCard';
import Dialog_FileDelete from 'dialogs/FilesDelete';
import Upload from 'dialogs/Upload';
import useChecklist from 'lib/hooks/useChecklist';
import useFetch from 'lib/hooks/useFetch';
import useQuery from 'lib/hooks/useQuery';
import useRequest from 'lib/hooks/useRequest';
import {isType} from 'lib/mime';
import {showError, showSuccess} from 'lib/notification';
import {prettyBytes} from 'lib/utils';
import prettyMilliseconds from 'pretty-ms';
import {useEffect, useState} from 'react';
import {FaBomb, FaLock} from 'react-icons/fa';
import {FiClipboard, FiExternalLink, FiSearch, FiTrash, FiUpload, FiX} from 'react-icons/fi';
import {ImQrcode} from 'react-icons/im';
import {MdArrowUpward, MdChecklist, MdClearAll, MdDelete} from 'react-icons/md';
import {RiDeleteBinFill, RiErrorWarningFill, RiHardDriveFill} from 'react-icons/ri';

function FileCardInner({handler, checked, file, ...props}) {
  return (
    <Group position='apart' {...props}>
      <Group spacing={4}>
        <Checkbox value={file.id} mb={2} mr={1} onChange={e => {
          e.stopPropagation();
          handler(e.target.value);
        }} checked={checked}/>
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
      <Badge px='xs' variant='filled' radius='xs'>
        <Group spacing={4} align='center' position='center'>
          <RiHardDriveFill size={12}/>
          <Text size='xs' weight={700}>
            {prettyBytes(file.size)}
          </Text>
        </Group>
      </Badge>
    </Group>
  );
}

export default function Page_Files() {
  const [page, setPage] = useState(1);
  const [chunk, setChunk] = useState('30');
  const {busy, request} = useRequest();
  const {query, handler: qHandler} = useQuery();
  const {checkedItems, size, toggle, checkAll, uncheckAll, isChecked, setData} = useChecklist();
  const {
    data,
    mutate
  } = useFetch(`/api/user/files?page=${page}&chunk=${chunk}`);
  useEffect(() => {
    if (data)
      setData(data.files.map(f => f.id));
  }, [data]);
  const del = (...tokens: string[]) =>
    request({
      endpoint: '/api/delete',
      method: 'DELETE',
      body: tokens,
      callback(j) {
        if (j.deleted.length > 1) {
          openModal({
            title: 'Following files have been deleted successfully.',
            children: <Dialog_FileDelete files={j.deleted.map(f => f.fileName)}/>
          });
        } else showSuccess('Successfully deleted the file!', <RiDeleteBinFill/>, j.deleted[0].fileName);
      },
      onError: e =>
        showError('Failed to delete the file', <RiErrorWarningFill/>, e),
      onDone: mutate
    });
  const deleteFiles = (...ids: string[]) => {
    const files = data.files.filter(f => ids.includes(f.id));
    if (files.length === 0 || busy) return;
    openConfirmModal({
      title: `Are you sure you want to delete ${files.length === 1 ? 'this file' : 'these files'}?`,
      children: <Dialog_FileDelete files={files.map(f => f.fileName)}/>,
      labels: {confirm: 'Delete', cancel: 'Cancel'},
      confirmProps: {
        color: 'red',
        leftIcon: <FiTrash/>,
        loading: busy
      },
      cancelProps: {
        leftIcon: <FiX/>
      },
      onConfirm: () => del(...files.map(f => f.deletionToken))
    });
  };
  const [opened, dHandler] = useDisclosure(false);
  const [scroll, scrollTo] = useWindowScroll();
  return data && data.error ? (
    <Center style={{height: '90vh'}}>
      <Stack align='center'>
        <Title order={2}>
          {data.error}
        </Title>
        <Title order={3}>
          Rate limit resets
          in {prettyMilliseconds(data.nextReset, {verbose: true, keepDecimalsOnWholeSeconds: false})}
        </Title>
      </Stack>
    </Center>
  ) : (
    <Fallback loaded={data}>
      {() => (
        <>
          <Upload opened={opened} onClose={dHandler.close} onUpload={mutate}/>
          <Affix zIndex={0} position={{
            bottom: '2%',
            right: '2%'
          }}>
            <Paper>
              <Group spacing={4}>
                <Transition transition='skew-up' mounted={size > 0}>
                  {styles => (
                    <Text size='xs' weight={700} style={styles} ml='sm'>
                      Selected {size} files
                    </Text>
                  )}
                </Transition>
                <Transition transition='slide-up' duration={200} mounted={size < data.files.length}>
                  {styles => (
                    <ActionIcon style={styles}
                      onClick={checkAll}
                      color='green'
                      variant='transparent'
                      size='lg'>
                      <MdChecklist/>
                    </ActionIcon>
                  )}
                </Transition>
                <Transition transition='slide-left' duration={200} mounted={size > 0}>
                  {styles => (
                    <Group spacing={4} style={styles}>
                      <ActionIcon onClick={uncheckAll} color='yellow'
                        variant='transparent' size='lg'>
                        <MdClearAll/>
                      </ActionIcon>
                      <ActionIcon onClick={() => deleteFiles(...checkedItems)} loading={busy} variant='transparent'
                        size='lg' color='red'>
                        <MdDelete/>
                      </ActionIcon>
                    </Group>
                  )}
                </Transition>
                <Transition mounted={scroll.y > 0} transition='slide-left' duration={200}>
                  {styles => (
                    <ActionIcon variant='transparent' color='blue' size='lg' onClick={() => scrollTo({y: 0})}
                      style={styles}>
                      <MdArrowUpward/>
                    </ActionIcon>
                  )}
                </Transition>
              </Group>
            </Paper>
          </Affix>
          <Stack>
            <div style={{display: 'flex'}}>
              <Button leftIcon={<FiUpload/>} onClick={dHandler.open}>Upload</Button>
              <Autocomplete style={{flex: 1}} mx='xs' icon={<FiSearch/>} placeholder='Search something' value={query}
                onChange={qHandler.set}
                data={(data && data.files) ? Array.from(new Set(data.files?.map(file => file.fileName))) : []}/>
              <Tooltip label='Items per page'>
                <Select style={{width: 72}} data={['15', '30', '45']} value={chunk}
                  onChange={setChunk}/>
              </Tooltip>
            </div>
            <CardGrid itemSize={300} maxItems={16}>
              {data.files && qHandler.filterList(data.files, ['fileName']).map((file, i) => <ItemCard key={i}
                title={file.fileName}
                actions={[
                  {
                    label: 'Show QR code',
                    color: 'yellow',
                    action: () => openContextModal({
                      modal: 'qr',
                      innerProps: {
                        value: `${window.location.origin}/${file.slug}`
                      }
                    }),
                    icon:
                                                                                                            <ImQrcode/>
                  }, {
                    label: 'Open in new tab',
                    color: 'blue',
                    icon:
                                                                                                            <FiExternalLink/>,
                    action: () => window?.open(`/${file.slug}`, '_blank')
                  }, {
                    label: 'Copy to clipboard',
                    color: 'green',
                    icon:
                                                                                                            <FiClipboard/>,
                    value: `${window.location.origin}/${file.slug}`
                  }, {
                    label: 'Delete',
                    busy,
                    color: 'red',
                    icon:
                                                                                                            <FiTrash/>,
                    action: () => deleteFiles(file.id)
                  }
                ]}>
                {isType('image', file.mimetype) ? (
                  <BackgroundImage src={`/api/file/${file.id}?preview=true`}>
                    <div style={{height: 125, padding: 8}}>
                      <FileCardInner handler={toggle}
                        checked={isChecked(file.id)} file={file}/>
                    </div>
                  </BackgroundImage>
                ) : (
                  <Center
                    sx={theme => ({height: 125, background: theme.colors.dark[theme.colorScheme === 'dark' ? 8 : 0]})}>
                    <FileCardInner handler={toggle}
                      checked={isChecked(file.id)} file={file}
                      style={{position: 'absolute', top: 8, left: 8, right: 8}}/>
                    <FileIndicator size={64} mimetype={file.mimetype}/>
                  </Center>
                )}
              </ItemCard>
              )}
            </CardGrid>
          </Stack>
          <Pagination mt='xl' withEdges position='center' page={page} onChange={setPage}
            total={data?.totalPages || 0}/></>
      )}
    </Fallback>
  );
}

Page_Files.title = 'Files';
Page_Files.authRequired = true;
