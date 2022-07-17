import {Button, Checkbox, Group, Modal, Select, Stack, TextInput} from '@mantine/core';
import {useSetState} from '@mantine/hooks';
import useFetch from 'lib/hooks/useFetch';
import dynamic from 'next/dynamic';
import {FiDownload} from 'react-icons/fi';

const Preview = dynamic(() => import('components/ShareXPreview'));

export default function Dialog_ShareX({open, onClose, ...props}) {
  const { data: token } = useFetch('/api/user/token');
  const [ shareXOptions, setShareXOptions ] = useSetState({ name: 'Void', url: 'alphanumeric', askPassword: false });
  const uploaderConfig = {
    Version: '13.2.1',
    Name: shareXOptions.name,
    DestinationType: 'ImageUploader, FileUploader, TextUploader',
    RequestMethod: 'POST',
    RequestURL: `${typeof window !== 'undefined' && window.location.origin}/api/upload`,
    Headers: {
      Authorization: token?.privateToken,
      URL: shareXOptions.url
    },
    URL: '$json:[0].url$',
    ThumbnailURL: '$json:thumbUrl$',
    DeletionURL: '$json:deletionUrl$',
    ErrorMessage: '$json:error$',
    Body: 'MultipartFormData',
    FileFormName: 'files'
  };
  const shortenerConfig = {
    Version: '13.2.1',
    Name: shareXOptions.name,
    DestinationType: 'URLShortener, URLSharingService',
    RequestMethod: 'POST',
    RequestURL: `${typeof window !== 'undefined' && window.location.origin}/api/shorten`,
    Headers: {
      Authorization: token?.privateToken
    },
    Body: 'FormURLEncoded',
    Arguments: {
      Destination: '$input$',
      URL: shareXOptions.url,
      ...(shareXOptions.askPassword && { Password: '$prompt:Password$' })
    },
    URL: '$json:url$',
    ErrorMessage: '$json:error$'
  };
  return (
    <Modal opened={open} size='2xl' title='Generate ShareX config' onClose={onClose} styles={{
      title: {
        fontWeight: 700,
        fontSize: 17
      }
    }} {...props}>
      <Group align='start' mb={48}>
        <Stack spacing={4}>
          <TextInput label='Config name' value={shareXOptions.name} onChange={e => setShareXOptions({ name: e.target.value })}/>
          <Select label='URL' data={['alphanumeric', 'emoji', 'invisible']} value={shareXOptions.url} onChange={url => setShareXOptions({ url })}/>
          <Checkbox label='Ask password when shortening?' mt='xs' checked={shareXOptions.askPassword} onChange={e => setShareXOptions({ askPassword: e.target.checked })}/>
        </Stack>
        <Preview uploaderConfig={uploaderConfig} shortenerConfig={shortenerConfig}/>
      </Group>
      <Group mt='md' style={{ position: 'absolute', right: 24, bottom: 16 }}>
        <Button leftIcon={<FiDownload/>} variant='gradient' gradient={{ from: 'yellow', to: 'red' }} download='Void_Uploader.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(uploaderConfig,null,'\t')],{type:'application/json'}))} component='a'>Uploader</Button>
        <Button leftIcon={<FiDownload/>} variant='gradient' gradient={{ from: 'blue', to: 'green' }} download='Void_Shortener.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(shortenerConfig,null,'\t')],{type:'application/json'}))} component='a'>Shortener</Button>
      </Group>
    </Modal>
  );
}
