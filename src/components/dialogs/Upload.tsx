import {
  Button,
  Checkbox,
  Divider,
  Group,
  GroupedTransition,
  HoverCard,
  Image,
  Modal,
  Popover,
  Progress,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
  useMantineTheme
} from '@mantine/core';
import {Dropzone} from '@mantine/dropzone';
import {useClipboard, useListState, useSetState} from '@mantine/hooks';
import {openModal} from '@mantine/modals';
import FileIndicator from 'components/FileIndicator';
import Dialog_FilesUploaded from 'dialogs/FilesUploaded';
import {format} from 'fecha';
import useRequest from 'lib/hooks/useRequest';
import useUpload from 'lib/hooks/useUpload';
import {isType} from 'lib/mime';
import {showError, showSuccess} from 'lib/notification';
import {prettyBytes} from 'lib/utils';
import prettyMilliseconds from 'pretty-ms';
import {useEffect, useState} from 'react';
import {FiExternalLink, FiFile, FiTrash, FiUpload, FiX} from 'react-icons/fi';
import {GoSettings} from 'react-icons/go';
import {RiFileWarningFill, RiSignalWifiErrorFill, RiUploadCloud2Fill} from 'react-icons/ri';
import {VscClearAll, VscFiles} from 'react-icons/vsc';

function getIconColor(status, theme) {
  return status === 'accepted'
    ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
    : status === 'rejected'
      ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
      : theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7];
}

function ImageUploadIcon({status, ...props}) {
  return status === 'accepted' ? <FiUpload {...props} /> : status === 'rejected' ? <FiX {...props} /> :
    <FiFile {...props} />;
}

function DropzoneBody({restrictions, theme, status = 'idle'}) {
  return (
    <Group position='center' spacing='xl' style={{minHeight: 150, pointerEvents: 'none'}}>
      <ImageUploadIcon status={status} style={{color: getIconColor(status, theme)}} size={48} />
      <div>
        <Text size='xl' inline>
          Drag files here or click to select files.
        </Text>
        {(restrictions?.bypass) || (
          <>
            <Text size='sm' color='dimmed' inline mt={7}>
              Max {restrictions?.maxFileCount} file{restrictions?.maxFileCount > 1 && 's'}, each should not
              exceed {prettyBytes(restrictions?.maxSize)}.
            </Text>
            <Text size='sm' color='dimmed' inline>
              Blacklisted
              extension{restrictions?.blacklistedExtensions?.length > 1 && 's'}: {restrictions?.blacklistedExtensions?.join(', ')}
            </Text>
          </>
        )}
      </div>
    </Group>
  );
}

type VoidFile = {
  selected: boolean;
} & File;

export default function Dialog_Upload({opened, onClose, onUpload, ...props}) {
  const [files, fHandler] = useListState<VoidFile>([]);
  const selected = files.filter(f => f.selected);
  const {request} = useRequest();
  const [progress, setProgress] = useState({progress: 0, speed: 0, estimated: 0});
  const [restrictions, setRestrictions] = useState({
    bypass: false,
    blacklistedExtensions: [],
    maxSize: 0,
    maxFileCount: 5
  });
  useEffect(() => {
    request({
      endpoint: '/api/upload',
      callback: setRestrictions
    });
  }, []);
  let previews = [];
  const preview = (file: File): string => {
    const url = URL.createObjectURL(file);
    previews.push({file: file.name, url});
    return url;
  };
  const [busy, setBusy] = useState(false);
  const theme = useMantineTheme();
  const clip = useClipboard();
  const [prefs, setPrefs] = useSetState({exploding: false, url: 'alphanumeric', private: false});
  // handlers
  const errorHandler = (message: string) => {
    showError('Failed to upload the file(s).', <RiSignalWifiErrorFill />, message);
    setBusy(false);
  };
  const uploadedHandler = data => {
    const remaining = files.filter(x => !x.selected).map((x, i) => {
      x.selected = i <= restrictions.maxFileCount || restrictions.bypass;
      return x;
    });
    fHandler.setState(remaining);
    if (data.length > 1) {
      onClose();
      openModal({
        title: 'Files uploaded',
        children: <Dialog_FilesUploaded files={data} />
      });
    } else {
      showSuccess(<Title order={6}>File uploaded!</Title>, <RiUploadCloud2Fill />, (
        <div>
          <Group grow spacing={4} my='sm'>
            <Button variant='subtle' component='a' href={data[0].url} target='_blank'
              leftIcon={<FiExternalLink />}>View</Button>
            <Button variant='subtle' component='a' href={data[0].thumbUrl} target='_blank' color='blue'
              leftIcon={<FiFile />}>Raw</Button>
            <Button variant='subtle' component='a' href={data[0].deletionUrl} target='_blank' color='red'
              leftIcon={<FiTrash />}>Delete</Button>
          </Group>
          <Text color='dimmed' weight={700} size='xs'>The URL has been copied to your clipboard.</Text>
        </div>
      ));
      clip.copy(data[0].url);
    }
    setBusy(false);
    onClose();
    onUpload();
  };
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
    'Exploding': prefs.exploding.toString(),
    'Private': prefs.private.toString()
  }, setProgress, errorHandler, uploadedHandler);
  const uploadFiles = () => {
    if (selected.length < 1) return;
    setBusy(true);
    const body = new FormData();
    selected.forEach(f => body.append('files', f));
    upload(body);
  };
  return (
    <Modal size={600} opened={opened} onClose={onClose} {...props} title='Upload files'>
      <Stack>
        <Dropzone loading={busy} multiple {...(restrictions.bypass ? {} : {maxSize: restrictions.maxSize})}
          onReject={files => showError(
            'Following files are not accepted!',
            <RiFileWarningFill />,
            files.map((x, i) => <Text
              style={{maxWidth: 325, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              inline
              key={i}>{x.file.name}</Text>
            ))} onDrop={f =>
            fHandler.append(...f.filter(file => restrictions.bypass || !restrictions.blacklistedExtensions?.includes(file.name.split('.').pop())).map((f: VoidFile, i) => {
              f.selected = i <= restrictions.maxFileCount || restrictions.bypass;
              return f;
            }))
          }>
          <Dropzone.Idle>
            <DropzoneBody theme={theme} restrictions={restrictions} />
          </Dropzone.Idle>
          <Dropzone.Accept>
            <DropzoneBody theme={theme} restrictions={restrictions} status='accepted' />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <DropzoneBody theme={theme} restrictions={restrictions} status='rejected' />
          </Dropzone.Reject>
        </Dropzone>
        <GroupedTransition transitions={{
          text: {duration: 600, transition: 'slide-down'},
          bar: {duration: 600, transition: 'slide-up'}
        }} mounted={busy}>
          {styles => (
            <>
              <Title style={styles.text} order={5}>{progress.speed.toFixed(2)} Mbps
                -
                About {prettyMilliseconds(progress.estimated * 1e3, {
                verbose: true,
                secondsDecimalDigits: 0
              })} remaining.</Title>
              <Progress style={styles.bar} animate striped value={progress.progress} />
            </>
          )}
        </GroupedTransition>
        <Group grow position='apart'>
          <Popover>
            <Popover.Target>
              <Button fullWidth leftIcon={<VscFiles />}>
                Show files ({files.length})
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <ScrollArea mt={4} scrollbarSize={4} style={{height: 175, maxWidth: 200}}>
                <Stack spacing={4}>
                  {files.map((x, i) => (
                    <HoverCard key={i} withinPortal position='right'>
                      <HoverCard.Target>
                        <Button style={{maxWidth: 200, position: 'relative'}} size='xs'
                          onClick={() => fHandler.setItem(i, (() => {
                            x.selected = !x.selected;
                            return x;
                          })())} variant={x.selected ? 'filled' : 'default'}>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <FileIndicator mimetype={x.type} size={14} />
                            <Text style={{
                              marginLeft: 8,
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>{x.name}</Text>
                          </div>
                        </Button>
                      </HoverCard.Target>
                      <HoverCard.Dropdown>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          {(isType('image', x.type)) && (
                            <Image imageProps={{loading: 'lazy'}} styles={{
                              image: {
                                objectFit: 'contain',
                                maxWidth: '15vw',
                                maxHeight: 175
                              }
                            }} mr='sm' src={preview(x)} alt='Preview' />
                          )}
                          <Table>
                            <tbody>
                              {[['Name', x.name], ['Size', prettyBytes(x.size)], ['Mimetype', x.type.length < 1 ? 'unknown' : x.type], ['Last modified', format(new Date(x.lastModified || 0), 'fullDate')]].map(([x, y]) => (
                                <tr key={x}>
                                  <td>
                                    <strong>
                                      {x}
                                    </strong>
                                  </td>
                                  <td>{y}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  ))}
                </Stack>
              </ScrollArea>
              <Divider my='xs' mx='md' />
              <Group noWrap spacing={0} mx={4}>
                <Button fullWidth onClick={() => {
                  fHandler.setState([]);
                  previews.forEach(i => URL.revokeObjectURL(i));
                  previews = [];
                }} size='xs' leftIcon={<VscClearAll />} disabled={busy || files.length === 0} color='red'
                style={{minWidth: 150}}>
                  Clear all
                </Button>
              </Group>
            </Popover.Dropdown>
          </Popover>
          <Popover>
            <Popover.Target>
              <Button fullWidth leftIcon={<GoSettings />} variant='filled' color='blue'>
                Preferences
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                <SegmentedControl data={['alphanumeric', 'emoji', 'invisible']} value={prefs.url}
                  onChange={url => setPrefs({url})} />
                <Checkbox checked={prefs.exploding} onChange={e => setPrefs({exploding: e.target.checked})}
                  label='Exploding' />
                <Checkbox checked={prefs.private} onChange={e => setPrefs({private: e.target.checked})}
                  label='Private' />
              </Stack>
            </Popover.Dropdown>
          </Popover>
          <Button color={busy ? 'red' : 'green'} onClick={busy ? () => {
            onCancel();
          } : uploadFiles} disabled={!busy && selected.length < 1}
          leftIcon={busy ? <FiX /> : <FiUpload />}>{busy ? 'Cancel' : 'Upload'}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
