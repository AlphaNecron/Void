import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  GroupedTransition,
  Image,
  MantineTheme,
  Modal,
  Popover,
  Progress,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Title,
  useMantineTheme
} from '@mantine/core';
import {Dropzone, DropzoneStatus} from '@mantine/dropzone';
import {useClipboard, useDisclosure, useListState, useSetState} from '@mantine/hooks';
import {useModals} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import FileIndicator from 'components/FileIndicator';
import StyledMenu from 'components/StyledMenu';
import StyledTooltip from 'components/StyledTooltip';
import {useUpload} from 'lib/hooks/useUpload';
import {isType} from 'lib/mime';
import {parseByte} from 'lib/utils';
import {DateTime, Duration} from 'luxon';
import React, {useEffect, useState} from 'react';
import {FiFile, FiUpload, FiX} from 'react-icons/fi';
import {GoSettings} from 'react-icons/go';
import {RiErrorWarningFill, RiFileWarningFill, RiSignalWifiErrorFill, RiUploadCloud2Fill} from 'react-icons/ri';
import {VscClearAll, VscFiles} from 'react-icons/vsc';

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  return status.accepted
    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
    : status.rejected
      ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
      : theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7];
}

function ImageUploadIcon({status, ...props}) {
  return status.accepted ? <FiUpload {...props} /> : status.rejected ? <FiX {...props} /> : <FiFile {...props} />;
}

interface VoidFile extends File {
  selected: boolean;
}

export default function Dialog_Upload({opened, onClose, onUpload, ...props}) {
  const [files, fHandler] = useListState<VoidFile>([]);
  const [flOpen, handler] = useDisclosure(false);
  const selected = files.filter(f => f.selected);
  const [progress, setProgress] = useState({progress: 0, speed: 0, estimated: 0});
  const { openContextModal } = useModals();
  const [restrictions, setRestrictions] = useState({
    bypass: false,
    blacklistedExtensions: [],
    maxSize: 0,
    maxFileCount: 5
  });
  useEffect(() => {
    fetch('/api/upload').then(res => res.json()).then(setRestrictions);
  }, []);
  let previews = [];
  const preview = (file: File): string => {
    const url = URL.createObjectURL(file);
    previews.push({file: file.name, url});
    return url;
  };
  const [busy, setBusy] = useState(false);
  const theme = useMantineTheme();
  const clipboard = useClipboard();
  const [prefs, setPrefs] = useSetState({exploding: false, url: 'alphanumeric', private: false});
  const pasteHandler = (e: ClipboardEvent) => {
    e.preventDefault();
    const image = Array.from(e.clipboardData.items).find(x => isType('image', x.type));
    if (!image) return;
    setBusy(true);
    const file = image.getAsFile() as VoidFile;
    file.selected = true;
    fHandler.append(file);
    e.preventDefault();
    setBusy(false);
  };
  useEffect(() => {
    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, []);
  const {upload, onCancel} = useUpload('/api/upload', {
    'URL': prefs.url,
    'Exploding': prefs.exploding ? 'true' : 'false',
    'Private': prefs.private ? 'true' : 'false'
  }, setProgress);
  const uploadFiles = async () => {
    try {
      if (selected.length < 1) return;
      setBusy(true);
      const body = new FormData();
      files.filter(f => f.selected).forEach(f => body.append('files', f));
      const res = await upload(body);
      const data = res.data;
      if (res.status === 200 && !data.error) {
        const remaining = files.filter(x => !x.selected).map((x, i) => {
          x.selected = i <= restrictions.maxFileCount || restrictions.bypass;
          return x;
        });
        fHandler.setState(remaining);
        if (data.length > 1) {
          onClose();
          openContextModal('uploaded', {
            title: 'Files uploaded',
            innerProps: {
              files: data,
              onCopy: clipboard.copy
            }
          });
        } else {
          showNotification({
            title: <Title order={6}>File uploaded!</Title>,
            message: (
              <div>
                <Anchor size='sm' target='_blank' href={data[0].url}>File URL</Anchor>
                <br/>
                <Anchor size='sm' target='_blank' href={data[0].thumbUrl}>Raw file URL</Anchor>
                <br/>
                <Anchor size='sm' target='_blank' href={data[0].deletionUrl} color='red'>Delete</Anchor>
                <br/>
                <Text color='dimmed' weight={700} size='xs'>The URL has been copied to your clipboard.</Text>
              </div>
            ),
            color: 'green',
            icon: <RiUploadCloud2Fill/>
          });
          clipboard.copy(data[0].url);
        }
        onUpload();
      } else showNotification({
        title: 'Failed to upload the file(s).',
        message: data.error,
        color: 'red',
        icon: <RiSignalWifiErrorFill/>
      });
    } catch (e) {
      showNotification({
        title: 'Error occurred during file upload.',
        message: e.message,
        color: 'red',
        autoClose: true,
        icon: <RiErrorWarningFill/>
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal size={600} opened={opened} overlayBlur={4} onClose={onClose} {...props} title='Upload files'>
      <Stack>
        <Dropzone loading={busy} multiple {...(restrictions.bypass ? {} : {maxSize: restrictions.maxSize})}
          onReject={files => showNotification({
            title: 'Following files are not accepted!',
            message: files.map((x, i) => <Text
              style={{maxWidth: 325, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} inline
              key={i}>{x.file.name}</Text>
            ),
            color: 'red',
            icon: <RiFileWarningFill/>
          })} onDrop={f =>
            fHandler.append(...f.filter(file => restrictions.bypass || !restrictions.blacklistedExtensions?.includes(file.name.split('.').pop())).map((f: VoidFile, i) => {
              f.selected = i <= restrictions.maxFileCount || restrictions.bypass;
              return f;
            }))
          }>
          {(status) => (
            <Group position='center' spacing='xl' style={{minHeight: 150, pointerEvents: 'none'}}>
              <ImageUploadIcon status={status} style={{color: getIconColor(status, theme)}} size={48}/>
              <div>
                <Text size='xl' inline>
                  Drag files here or click to select files.
                </Text>
                {(restrictions?.bypass) || (
                  <>
                    <Text size='sm' color='dimmed' inline mt={7}>
                      Max {restrictions?.maxFileCount} file{restrictions?.maxFileCount > 1 && 's'}, each should not
                      exceed {parseByte(restrictions?.maxSize)}.
                    </Text>
                    <Text size='sm' color='dimmed' inline>
                      Blacklisted
                      extension{restrictions?.blacklistedExtensions?.length > 1 && 's'}: {restrictions?.blacklistedExtensions?.join(', ')}
                    </Text>
                  </>
                )}
              </div>
            </Group>
          )}
        </Dropzone>
        <GroupedTransition transitions={{
          text: { duration: 600, transition: 'slide-down' },
          bar: { duration: 600, transition: 'slide-up' }
        }} mounted={busy}>
          {styles => (
            <>
              <Title style={styles.text} order={5}>{progress.speed.toFixed(2)} Mbps
              -
              About {Duration.fromMillis(progress.estimated * 1e3).shiftTo('hours', 'minutes', 'seconds').toHuman({maximumFractionDigits: 0})} remaining.</Title>
              <Progress style={styles.bar} animate striped value={progress.progress}/>
            </>
          )}
        </GroupedTransition>
        <Group grow position='apart'>
          <Popover styles={theme => ({
            body: {
              border: `2px solid ${theme.colors.dark[theme.colorScheme === 'dark' ? 4 : 0]}`
            }
          })} opened={flOpen && files.length > 0} onClose={handler.close} target={
            <Button disabled={files.length === 0} onClick={handler.toggle} fullWidth leftIcon={<VscFiles/>}>Show files
              ({files.length})</Button>
          }>
            <ScrollArea mt={4} scrollbarSize={4} style={{height: 175}}>
              <Stack spacing={4}>
                {files.map((x, i) => (
                  <StyledTooltip key={i} label={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      {(isType('image', x.type)) && (
                        <Image styles={{
                          image: {
                            objectFit: 'contain',
                            maxWidth: '15vw',
                            maxHeight: 175
                          }
                        }} mr='sm' src={preview(x)} alt='Preview'/>
                      )}
                      <Table>
                        <tbody>
                          {[['Name', x.name], ['Size', parseByte(x.size)], ['Mimetype', x.type.length < 1 ? 'unknown' : x.type], ['Last modified', DateTime.fromMillis(x.lastModified || 0).toFormat('FFF')]].map(([x, y]) => (
                            <tr key={x}>
                              <td><strong>{x}</strong></td>
                              <td>{y}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  }>
                    <Button fullWidth size='xs' onClick={() => fHandler.setItem(i, (() => {
                      x.selected = !x.selected;
                      return x;
                    })())} variant={x.selected ? 'filled' : 'default'}>
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <FileIndicator mimetype={x.type} size={14}/>
                        <Text style={{
                          marginLeft: 8,
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{x.name}</Text>
                      </div>
                    </Button>
                  </StyledTooltip>
                ))}
              </Stack>
            </ScrollArea>
            <Divider my='xs' mx='md'/>
            <Group noWrap spacing={0} mx={4}>
              <Button fullWidth onClick={() => {
                fHandler.setState([]);
                previews.forEach(i => URL.revokeObjectURL(i));
                previews = [];
              }} size='xs' leftIcon={<VscClearAll/>} disabled={busy} color='red'>
                Clear all
              </Button>
            </Group>
          </Popover>
          <StyledMenu control={
            <Button fullWidth leftIcon={<GoSettings/>} variant='filled' color='blue'>
              Preferences
            </Button>
          }>
            <Stack p={16}>
              <Select label='URL' data={['alphanumeric', 'emoji', 'invisible']} value={prefs.url}
                onChange={url => setPrefs({url})}/>
              <Checkbox checked={prefs.exploding} onChange={e => setPrefs({exploding: e.target.checked})}
                label='Exploding'/>
              <Checkbox checked={prefs.private} onChange={e => setPrefs({private: e.target.checked})} label='Private'/>
            </Stack>
          </StyledMenu>
          <Button color={busy ? 'red' : 'green'} onClick={busy ? () => {
            onCancel();
          } : uploadFiles} disabled={!busy && selected.length < 1}
          leftIcon={busy ? <FiX/> : <FiUpload/>}>{busy ? 'Cancel' : 'Upload'}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
