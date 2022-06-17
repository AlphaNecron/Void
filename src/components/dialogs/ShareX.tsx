import {Button, Checkbox, Group, Modal, Select, Stack, TextInput} from '@mantine/core';
import {useSetState} from '@mantine/hooks';
import {Prism} from '@mantine/prism';
import React from 'react';
import {FiDownload, FiScissors} from 'react-icons/fi';
import useSWR from 'swr';

export default function Dialog_ShareX({open, onClose, ...props}) {
  const { data: token } = useSWR('/api/user/token', (url: string) => fetch(url).then(r => r.json()));
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
        <Prism.Tabs>
          <Prism.Tab withLineNumbers icon={<FiDownload/>} language='json' noCopy label='Void_Uploader.sxcu'>
            {JSON.stringify({...uploaderConfig, Headers: { ...uploaderConfig.Headers, Authorization: '<MASKED>' }}, null, '\t')}
          </Prism.Tab>
          <Prism.Tab withLineNumbers icon={<FiScissors/>} language='json' noCopy label='Void_Shortener.sxcu'>
            {JSON.stringify({...shortenerConfig, Headers: { ...shortenerConfig.Headers, Authorization: '<MASKED>'}}, null, '\t')}
          </Prism.Tab>
        </Prism.Tabs>
      </Group>
      <Group mt='md' style={{ position: 'absolute', right: 24, bottom: 16 }}>
        <Button leftIcon={<FiDownload/>} variant='gradient' gradient={{ from: 'yellow', to: 'red' }} download='Void_Uploader.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(uploaderConfig,null,'\t')],{type:'application/json'}))} component='a'>Uploader</Button>
        <Button leftIcon={<FiDownload/>} variant='gradient' gradient={{ from: 'blue', to: 'green' }} download='Void_Shortener.sxcu' href={URL.createObjectURL(new Blob([JSON.stringify(shortenerConfig,null,'\t')],{type:'application/json'}))} component='a'>Shortener</Button>
      </Group>
    </Modal>
  );
}
