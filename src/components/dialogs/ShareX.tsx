import {Button, Checkbox, Group, Modal, Select, Stack, TextInput, Transition, useMantineTheme} from '@mantine/core';
import {useMediaQuery, useSetState} from '@mantine/hooks';
import useFetch from 'lib/hooks/useFetch';
import dynamic from 'next/dynamic';
import {FiDownload} from 'react-icons/fi';

const Preview = dynamic(() => import('components/ShareXPreview'));

export default function Dialog_ShareX({open, onClose, ...props}) {
  const { data: token } = useFetch('/api/user/token');
  const [ shareXOptions, setShareXOptions ] = useSetState({ name: 'Void', url: 'alphanumeric', askPassword: false });
  const base = typeof window !== 'undefined' && window.location.origin;
  const {breakpoints} = useMantineTheme();
  const showPreview = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const sharedProps = {
    Version: '13.2.1',
    Name: shareXOptions.name.length > 0 ? shareXOptions.name : 'Void',
    RequestMethod: 'POST',
    Headers: {
      Authorization: token?.privateToken
    },
    ErrorMessage: '$json:error$'
  };
  const uploaderConfig = {
    ...sharedProps,
    RequestURL: `${base}/api/upload`,
    DestinationType: 'ImageUploader, FileUploader, TextUploader',
    Headers: {
      Authorization: token?.privateToken,
      URL: shareXOptions.url
    },
    URL: '$json:[0].url$',
    ThumbnailURL: '$json:thumbUrl$',
    DeletionURL: '$json:deletionUrl$',
    Body: 'MultipartFormData',
    FileFormName: 'files'
  };
  const shortenerConfig = {
    ...sharedProps,
    RequestURL: `${base}/api/shorten`,
    DestinationType: 'URLShortener, URLSharingService',
    Body: 'FormURLEncoded',
    Arguments: {
      Destination: '$input$',
      URL: shareXOptions.url,
      ...(shareXOptions.askPassword && { Password: '$prompt:Password$' })
    },
    URL: '$json:url$',
  };
  return (
    <Modal opened={open} size='2xl' title='Generate ShareX config' onClose={onClose} styles={{
      body: {
        minWidth: 300
      },
      title: {
        fontWeight: 700,
        fontSize: 17
      }
    }} {...props}>
      <div style={{ display: 'flex', marginBottom: 48, gap: 16, flexWrap: 'wrap' }}>
        <Stack spacing={4} style={{ flex: '1 1 200px' }}>
          <TextInput label='Config name' value={shareXOptions.name} onChange={e => setShareXOptions({ name: e.target.value })}/>
          <Select label='URL' data={['alphanumeric', 'emoji', 'invisible']} value={shareXOptions.url} onChange={url => setShareXOptions({ url })}/>
          <Checkbox label='Ask password when shortening?' mt='xs' checked={shareXOptions.askPassword} onChange={e => setShareXOptions({ askPassword: e.target.checked })}/>
        </Stack>
        <Transition transition='slide-up' mounted={showPreview}>
          {styles => <Preview sx={styles} name={shareXOptions.name.length > 0 ? shareXOptions.name : null} uploaderConfig={uploaderConfig} shortenerConfig={shortenerConfig}/>}
        </Transition>
      </div>
      <Group mt='md' style={{ position: 'absolute', right: 24, bottom: 16 }}>
        <Button leftIcon={<FiDownload/>} download='Void_Uploader.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(uploaderConfig,null,'\t')],{type:'application/json'}))} component='a'>Uploader</Button>
        <Button leftIcon={<FiDownload/>} color='blue' download='Void_Shortener.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(shortenerConfig,null,'\t')],{type:'application/json'}))} component='a'>Shortener</Button>
      </Group>
    </Modal>
  );
}
