import React, { useEffect, useState } from 'react';
import useFetch from 'lib/hooks/useFetch';
import { SimpleGrid, Skeleton, useToast } from '@chakra-ui/react';
import FileCard from 'components/FileCard';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const handleDelete = async file => {
    const res = await useFetch(`/api/delete?token=${file.deletionToken}`);
    if (res.success) {
      updateFiles();
      showToast('success', `Successfully deleted file ${file.origFileName}`);
    }
    else showToast('error', `Couldn't delete file ${file.origFileName}`);
  };
  const showToast = (srv, title) => {
    toast({
      title,
      status: srv,
      isClosable: true,
      duration: 3000
    });
  };
  const updateFiles = async () => {
    setBusy(true);
    const files = await useFetch('/api/user/files?filter=media');
    setFiles(files);
    setBusy(false);
  };
  useEffect(() => {
    updateFiles();
  }, []);
  return (
    <Skeleton isLoaded={!busy}>
      <SimpleGrid minChildWidth='150px' spacing='10px'>
        {files && (files.map((file, i) => (
          <FileCard file={file} m={2} key={i} onClick={() => {}} onDelete={handleDelete}/>
        )))}
      </SimpleGrid>
    </Skeleton>
  );
}