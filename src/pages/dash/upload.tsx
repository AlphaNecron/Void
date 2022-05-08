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
  Select,
  Stack, Table,
  Text,
  Tooltip,
  Transition,
  useMantineTheme
} from '@mantine/core';
import {Dropzone, DropzoneStatus} from '@mantine/dropzone';
import {useClipboard, useListState, useSetState} from '@mantine/hooks';
import {showNotification} from '@mantine/notifications';
import Container from 'components/Container';
import FileIndicator from 'components/FileIndicator';
import Layout from 'components/Layout';
import {isType} from 'lib/mime';
import {parseByte} from 'lib/utils';
import {DateTime} from 'luxon';
import React, {useEffect, useState} from 'react';
import {FiFile, FiUpload, FiX} from 'react-icons/fi';
import {GoSettings} from 'react-icons/go';
import {MdHideImage, MdImage} from 'react-icons/md';
import {
  RiClipboardFill,
  RiErrorWarningFill,
  RiFileWarningFill,
  RiSignalWifiErrorFill,
  RiUpload2Line,
  RiUploadCloud2Fill
} from 'react-icons/ri';
import {VscClearAll} from 'react-icons/vsc';

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
  return status.accepted ? <FiUpload {...props} /> : status.rejected ? <FiX {...props} /> : <FiFile {...props} />;

}

// TODO: UNIFY UPLOAD AND FILES

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
  const pasteHandler = (e: ClipboardEvent) => {
    const image = Array.from(e.clipboardData.items).find(x => isType('image', x.type));
    if (!image) return;
    setBusy(true);
    const file = image.getAsFile() as { id: string } & File;
    file.id = rng();
    fHandler.append(file);
    sHandler.append(file.id);
    e.preventDefault();
    setBusy(false);
  };
  useEffect(() => {
    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, []);
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
      <Center style={{ height: '88vh' }}>
        <div style={{ display: 'flex', overflow: 'auto' }}>
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
          <Transition transition='slide-right' mounted={files.length > 0}>
            {styles => (
              <Container style={styles} center={false} ml={4}>
                <Stack>
                  <ScrollArea mb={-20} mt={4} scrollbarSize={4} style={{ height: 175 }}>
                    <Chips spacing={4} radius='xs' styles={{
                      iconWrapper: {
                        display: 'none'
                      },
                      checked: {
                        backgroundColor: `${theme.colors[theme.primaryColor][6]} !important`,
                        color: theme.white,
                        padding: '0 20px'
                      },
                    }} direction='column' variant='filled' value={selectedFiles} onChange={sHandler.setState} multiple>
                      {files.map((x, i) => (
                        <Chip onContextMenu={() => false} key={i} value={x.id}>
                          <Popover color='red' placement='center' position='left' shadow='lg' withArrow opened={popOpen === i}
                            target={
                              <div style={{ display: 'flex', alignItems: 'center' }} onMouseEnter={() => setPopOpen(i)} onMouseLeave={() => setPopOpen(-1)}>
                                <FileIndicator mimetype={x.type} />
                                <Text ml={6} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} mr={5} weight={700}>{x.name}</Text>
                              </div>
                            }>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {(isType('image', x.type) && preview) && (
                                <Image styles={{
                                  image: {
                                    objectFit: 'contain',
                                    maxWidth: '10vw',
                                    maxHeight: 175
                                  }
                                }} mr='sm' onLoad={() => {
                                  const p = previewImgs.find(i => i.file === x.name);
                                  if (!p) return;
                                  previewImgs.splice(previewImgs.indexOf(p), 1);
                                  URL.revokeObjectURL(p.url);
                                }} src={previewImg(x)} alt='Preview' />
                              )}
                              <Table>
                                <tbody>
                                  {[['Name', x.name], ['Size', parseByte(x.size)], ['Mimetype', x.type], ['Last modified', DateTime.fromMillis(x.lastModified).toFormat('FFF')]].map(([x,y]) => (
                                    <tr key={x}>
                                      <td><strong>{x}</strong></td>
                                      <td>{y}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </Popover>
                        </Chip>
                      ))}
                    </Chips>
                  </ScrollArea>
                  <Group noWrap spacing={0} mx={4} mb={-16}>
                    <Tooltip label='Clear'>
                      <ActionIcon onClick={() => { fHandler.setState([]); sHandler.setState([]); previewImgs = []; }} size='md' color='red' variant='filled'>
                        <VscClearAll/>
                      </ActionIcon>
                    </Tooltip>
                    <Menu p='md' control={
                      <Tooltip label='Preferences'>
                        <ActionIcon size='md' mx={-12} variant='filled' color='blue'>
                          <GoSettings/>
                        </ActionIcon>
                      </Tooltip>
                    }>
                      <Stack>
                        <Select label='URL' data={['alphanumeric', 'emoji', 'invisible']} value={prefs.url} onChange={url => setPrefs({ url })}/>
                        <Checkbox checked={prefs.exploding} onChange={e => setPrefs({ exploding: e.target.checked })} label='Exploding'/>
                        <Checkbox checked={prefs.private} onChange={e => setPrefs({ private: e.target.checked })} label='Private'/>
                      </Stack>
                    </Menu>
                    <Button fullWidth color='green' onClick={() => upload()} disabled={selectedFiles.length === 0} size='xs' leftIcon={
                      <RiUpload2Line />
                    } loading={busy}>Upload</Button>
                  </Group>
                </Stack>
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
