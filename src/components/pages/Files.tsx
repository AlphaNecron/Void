import { IconButton, Input, InputGroup, InputRightElement, Radio, RadioGroup, Skeleton, Stack, useToast } from '@chakra-ui/react';
import Grid from 'components/FileGrid';
import List from 'components/FileList';
import useFetch from 'lib/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('grid');
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
    const files = await useFetch('/api/user/files');
    setFiles(files);
    setBusy(false);
  };
  useEffect(() => {
    updateFiles();
  }, []);
  return (
    <Skeleton isLoaded={!busy}>
      <Stack direction='row' alignItems='center' m={2} spacing={4}>
        <RadioGroup value={view} onChange={v => setView(v)}>
          <Stack spacing={2} direction='row'>
            <Radio colorScheme='purple' value='grid'>
              Grid
            </Radio>
            <Radio colorScheme='purple' value='list'>
              List
            </Radio>
          </Stack>
        </RadioGroup>
        <InputGroup size='sm'>
          <Input variant='filled' pr='4.5rem' placeholder='Search something' value={filter} onChange={f => setFilter(f.target.value)}/>
          <InputRightElement width='4.5rem'>
            <IconButton mr={-8} size='xs' variant='ghost' onClick={() => setFilter('')} aria-label='Clear' icon={<X size={12}/>}/>
          </InputRightElement>
        </InputGroup>
      </Stack>
      {view === 'grid' ? (
        <Grid files={files} onDelete={handleDelete} filter={filter}/>
      ) : (
        <List files={files} onDelete={handleDelete} filter={filter}/>
      )}
    </Skeleton>
  );
}