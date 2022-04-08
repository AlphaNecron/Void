import Layout from 'components/Layout';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Checkbox,
  Chip,
  Chips,
  Group,
  Image,
  MantineTheme,
  Menu,
  Popover,
  ScrollArea,
  Select, Stack,
  Text,
  Tooltip,
  Transition,
  useMantineTheme
} from '@mantine/core';
import {Dropzone, DropzoneStatus} from '@mantine/dropzone';
import {showNotification, useNotifications} from '@mantine/notifications';
import Container from 'components/Container';
import {BsFiles, BsUpload, BsXLg} from 'react-icons/bs';
import {
  RiClipboardFill,
  RiErrorWarningFill,
  RiFileWarningFill,
  RiSignalWifiErrorFill,
  RiUpload2Line,
  RiUploadCloud2Fill
} from 'react-icons/ri';
import {parseByte} from 'lib/utils';
import {GoSettings} from 'react-icons/go';
import {MdHideImage, MdImage} from 'react-icons/md';
import {useClipboard, useListState, useSetState} from '@mantine/hooks';
import {isType} from 'lib/mime';
import {VscClearAll} from 'react-icons/vsc';
import FileIndicator from 'components/FileIndicator';

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  return status.accepted
    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
    : status.rejected
      ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
      : theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7];
}

function ImageUploadIcon({ status, ...props }) {
  if (status.accepted) {
    return <BsUpload {...props} />;
  }

  if (status.rejected) {
    return <BsXLg {...props} />;
  }

  return <BsFiles {...props} />;
}

export default function Page_Upload() {
  const [files, fHandler] = useListState<{ id: string } & File>([]);
  const [selectedFiles, sHandler] = useListState<string>([]);
  const [preview, setPreview] = useState(true);
  const [popOpen, setPopOpen] = useState(-1);
  const [restrictions, setRestrictions] = useState({
    bypass: false,
    blacklistedExtensions: [],
    maxSize: 0,
    maxFileCount: 5
  });
  useEffect(() => {
    fetch('/api/upload').then(res => res.json()).then(setRestrictions);
  }, []);
  let previewImgs = [];
  const previewImg = (file: File): string => {
    const url = URL.createObjectURL(file);
    previewImgs.push({ file: file.name, url });
    return url;
  };
  const [busy, setBusy] = useState(false);
  const theme = useMantineTheme();
  const clipboard = useClipboard();
  const rng = () => (Math.random()*1e32).toString(36);
  const [prefs, setPrefs] = useSetState({ exploding: false, url: 'alphanumeric', private: false });
  useEffect(() => window.addEventListener('paste', (e: ClipboardEvent) => {
    const image = Array.from(e.clipboardData.items).find(x => isType('image', x.type));
    if (!image) return;
    setBusy(true);
    const file = image.getAsFile() as { id: string } & File;
    file.id = rng();
    fHandler.append(file);
    sHandler.append(file.id);
    e.preventDefault();
    setBusy(false);
  }), []);
  const upload = async () => {
    try {
      if (selectedFiles.length < 1) return;
      setBusy(true);
      const body = new FormData();
      selectedFiles.forEach(id => body.append('files', files.find(x => x.id === id)));
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'URL': prefs.url,
          'Exploding': prefs.exploding ? 'true' : 'false',
          'Private': prefs.private ? 'true' : 'false'
        },
        body
      });
      const json = await res.json();
      if (res.ok && !json.error) {
        const remaining = files.filter(file => !selectedFiles.includes(file.id));
        fHandler.setState(remaining);
        sHandler.setState(remaining.map(x => x.id).slice(0, restrictions?.bypass ? remaining.length : restrictions.maxFileCount));
        showNotification({
          title: 'File(s) uploaded!',
          message: (
            <ScrollArea style={{ maxHeight: 150 }}>
              {json.map((file, i) => <Anchor style={{ display: 'block' }} href={file.url} target='_blank' key={i}>{file.url}</Anchor>)}
            </ScrollArea>
          ),
          color: 'green',
          icon: <RiUploadCloud2Fill/>
        });
        clipboard.copy(json[0].url);
        showNotification({ title: 'Copied the first URL to your clipboard.', message: null, color: 'green', icon: <RiClipboardFill/> });
      }
      else showNotification({ title: 'Failed to upload the file(s).', message: json.error, color: 'red', icon: <RiSignalWifiErrorFill/> });
    } catch (e) {
      showNotification({ title: 'Error occurred during file upload.', message: e.message, color: 'red', autoClose: true, icon: <RiErrorWarningFill/> });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Layout id={2} rightChildren={
      <Tooltip label={`${preview ? 'Disable' : 'Enable'} image preview`}>
        <ActionIcon onClick={() => setPreview(p => !p)} size='lg' variant='default'>
          {preview ? <MdHideImage /> : <MdImage />}
        </ActionIcon>
      </Tooltip>
    }>
      <Center style={{ height: '87vh' }}>
        <div style={{ display: 'flex' }}>
          <Container center={false}>
            <Dropzone loading={busy} px={64} py={32} multiple {...(restrictions.bypass || { maxSize: restrictions.maxSize })} onReject={files => showNotification({
              title: 'Following files are not accepted!',
              message: files.map((x, i) => <Text style={{ maxWidth: 325, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} inline key={i}>{x.file.name}</Text>),
              color: 'red',
              icon: <RiFileWarningFill />
            })} onDrop={f => {
              fHandler.append(...f.filter(file => restrictions.bypass || !restrictions.blacklistedExtensions?.includes(file.name.split('.').pop())).map((file: { id: string } & File) => { file.id = rng(); return file; }));
              sHandler.append(...f.map((x: { id } & File) => x.id).slice(0, restrictions?.bypass ? f.length : restrictions?.maxFileCount));
            }}>
              {(status) => (
                <Group position='center' spacing='xl' style={{ minHeight: 150, pointerEvents: 'none' }}>
                  <ImageUploadIcon status={status} style={{ color: getIconColor(status, theme) }} size={48} />
                  <div>
                    <Text size='xl' inline>
                      Drag files here or click to select files.
                    </Text>
                    {(restrictions?.bypass) || (
                      <>
                        <Text size='sm' color='dimmed' inline mt={7}>
                          Max {restrictions?.maxFileCount} file{restrictions?.maxFileCount > 1 && 's'}, each should not exceed {parseByte(restrictions?.maxSize)}.
                        </Text>
                        <Text size='sm' color='dimmed' inline>
                          Blacklisted extension{restrictions?.blacklistedExtensions?.length > 1 && 's'}: {restrictions?.blacklistedExtensions?.join(', ')}
                        </Text>
                      </>
                    )}
                  </div>
                </Group>
              )}
            </Dropzone>
          </Container>
          <Transition transition='slide-left' duration={200} mounted={files && files.length >= 1}>
            {styles => (
              <Container center={false} style={styles} ml='xs'>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <ScrollArea scrollbarSize={4} ml={-4} style={{ flex: 1, maxHeight: 175 }}>
                    <Stack>
                      <Chips radius='sm' styles={{
                        iconWrapper: {
                          display: 'none'
                        },
                        checked: {
                          backgroundColor: `${theme.colors[theme.primaryColor][6]} !important`,
                          color: theme.white,
                          padding: '0 8px'
                        },
                      }} direction='column' variant='filled' value={selectedFiles} onChange={sHandler.setState} multiple>
                        {files.map((x, i) => (
                          <Chip onContextMenu={() => false} key={i} value={x.id}>
                            <Popover color='red' placement='center' position='left' shadow='lg' withArrow opened={popOpen === i}
                              target={
                                <div style={{ display: 'flex', alignItems: 'center' }} onMouseEnter={() => setPopOpen(i)} onMouseLeave={() => setPopOpen(-1)}>
                                  <FileIndicator mimetype={x.type} />
                                  <Text ml={6} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: 225 }} weight={700}>{x.name}</Text>
                                </div>
                              }>
                              <Group my='-sm' position='apart'>
                                {(isType('image', x.type) && preview) && (
                                  <Image ml='-sm' width={200} height={175} mr={0} fit='contain' onLoad={() => {
                                    const p = previewImgs.find(i => i.file === x.name);
                                    previewImgs.splice(previewImgs.indexOf(p), 1);
                                    URL.revokeObjectURL(p.url);
                                  }} src={previewImg(x)} alt='Preview' />
                                )}
                                <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                                  <p>Name: {x.name}</p>
                                  <p>Size: {parseByte(x.size)}</p>
                                  <p>Mimetype: {x.type}</p>
                                  <p>Last modified: {(new Date(x.lastModified)).toLocaleString()}</p>
                                </div>
                              </Group>
                            </Popover>
                          </Chip>
                        ))}
                      </Chips>
                    </Stack>
                  </ScrollArea>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: -16 }}>
                    <Tooltip label='Clear'>
                      <ActionIcon onClick={() => { fHandler.setState([]); sHandler.setState([]); previewImgs = []; }} size='md' color='red' variant='filled'>
                        <VscClearAll/>
                      </ActionIcon>
                    </Tooltip>
                    <Menu p='md' control={
                      <Tooltip label='Preferences'>
                        <ActionIcon size='md' mx='-sm' variant='filled' color='blue'>
                          <GoSettings/>
                        </ActionIcon>
                      </Tooltip>
                    }>
                      <Stack>
                        <Select label='URL' data={['alphanumeric', 'emoji', 'invisible']} value={prefs.url} onChange={url => setPrefs({ url })}/>
                        <Checkbox checked={prefs.exploding} onChange={e => setPrefs(() => ({ exploding: e.target.checked }))} label='Exploding'/>
                        <Checkbox checked={prefs.private} onChange={e => setPrefs(() => ({ private: e.target.checked }))} label='Private'/>
                      </Stack>
                    </Menu>
                    <Button style={{ flex: 1 }} color='green' onClick={() => upload()} disabled={selectedFiles.length === 0} size='xs' leftIcon={
                      <RiUpload2Line />
                    } loading={busy}>Upload</Button>
                  </div>
                </div>
              </Container>
            )}
          </Transition>
        </div>
      </Center>
    </Layout>
  );
}

Page_Upload.title = 'Upload';
Page_Upload.authRequired = true;
