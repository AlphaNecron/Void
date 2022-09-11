import {Avatar, Button, Center, Group, Modal, ModalProps, Title} from '@mantine/core';
import {Dropzone, IMAGE_MIME_TYPE} from '@mantine/dropzone';
import useAbort from 'lib/hooks/useAbort';
import useRequest from 'lib/hooks/useRequest';
import {useEffect, useState} from 'react';
import {FiUploadCloud, FiX} from 'react-icons/fi';

export default function UpdateAvatar({onClose, onDone, ...props}: ModalProps & { onDone: () => void }) {
  const [file, setFile] = useState<File>(null);
  const {busy, request} = useRequest();
  const [previewUrl, setPreviewUrl] = useState('');
  const {abort, signal} = useAbort();
  useEffect(() => {
    if (previewUrl.length > 0) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (file)
      setPreviewUrl(URL.createObjectURL(file));
  }, [file]);
  const uploadAvatar = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    request({
      endpoint: '/api/user/avatar',
      method: 'PATCH',
      signal,
      body: formData,
      onDone
    });
  };
  const wrap = children => (
    <Center style={{borderRadius: '100%', width: 192, height: 192, alignItems: 'center', justifyContent: 'center'}}>
      <Title order={5}>{children}</Title>
    </Center>
  );
  return (
    <Modal title='Update avatar' onClose={() => busy || onClose()} {...props}>
      <Center>
        <Dropzone maxSize={2 * 1048576} radius={100} p={0} m='xl' multiple={false} accept={IMAGE_MIME_TYPE}
          onDrop={([f]) => setFile(f)}>
          <Dropzone.Idle>
            <Avatar size={192} radius={100} src={previewUrl} />
          </Dropzone.Idle>
          <Dropzone.Reject>
            {wrap('This file is not allowed.')}
          </Dropzone.Reject>
          <Dropzone.Accept>
            {wrap('Drop the file here.')}
          </Dropzone.Accept>
        </Dropzone>
      </Center>
      <Group spacing={4} position='right'>
        <Button color='dark' variant='default' leftIcon={<FiX />} onClick={() => {
          if (busy)
            abort();
          onClose();
        }}>
          Cancel
        </Button>
        <Button leftIcon={<FiUploadCloud />} loading={busy} onClick={uploadAvatar} disabled={!file}>
          Upload avatar
        </Button>
      </Group>
    </Modal>
  );
}
