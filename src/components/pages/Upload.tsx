import { Box, Button, Checkbox, Flex, Heading, HStack, Select, Text, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import { useStoreSelector } from 'lib/redux/store';
import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { Upload as UploadIcon } from 'react-feather';

export default function Upload() {
  const { token } = useStoreSelector(state => state.user);
  const toast = useToast();
  const [preserve, setPreserve] = useState(true);
  const [generator, setGenerator] = useState('random');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = (srv, title, description?) => {
    toast({
      title,
      description,
      status: srv,
      duration: 5000,
      isClosable: true,
    });
  };
  const handleFileUpload = async () => {
    try {
      const body = new FormData();
      body.append('file', file);
      setBusy(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Token': token,
          'Generator': generator,
          'PreserveFileName': preserve ? 'true' : ''
        },
        body
      });
      const json = await res.json();
      if (res.ok && !json.error) {
        showToast('success', 'File uploaded', json.url);
        if (copy(json.url))
          showToast('info', 'Copied the URL to your clipboard');
        else
          showToast('error', 'Couldn\'t upload the file', json.error);
      }
    }
    catch (error) {
      showToast('error', 'Error while uploading the file', error.message);
    }
    finally {
      setBusy(false);
    }
  };
  const fg = useColorModeValue('gray.800', 'white');
  const bg = useColorModeValue('gray.100', 'gray.700');
  const shadow = useColorModeValue('outline', 'dark-lg');
  return (
    <Flex minHeight='92vh' width='full' align='center' justifyContent='center'>
      <Box
        px={2}
        boxShadow='xl'
        bg={bg}
        fg={fg}
        justify='center'
        align='center'
        p={2}
        borderRadius={4}
        textAlign='left'
        shadow={shadow}
      >
        <VStack>
          <Heading fontSize='lg' m={1} align='left'>Upload a file</Heading>
          <Button m={2} variant='ghost' width='385' height='200'>
            <Dropzone disabled={busy} onDrop={acceptedFiles => setFile(acceptedFiles[0])}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <VStack {...getRootProps()}>
                  <input {...getInputProps()}/>
                  <UploadIcon size={56}/>
                  {isDragActive ? (
                    <Text fontSize='xl'>Drop the file here</Text>
                  ) : (
                    <Text fontSize='xl'>Drag a file here or click to upload one</Text>
                  )}
                  <Text fontSize='lg' colorScheme='yellow' isTruncated maxWidth='350'>{file && file.name}</Text>
                </VStack>
              )}
            </Dropzone>
          </Button>
          <HStack justify='stretch' width='385'>
            <Checkbox width='160' isChecked={preserve} colorScheme='purple' onChange={p => setPreserve(p.target.checked)}>Preserve filename</Checkbox>
            <Select size='sm' variant='filled' width='110' value={generator} onChange={selection => setGenerator(selection.target.value)}>
              <option value='random'>Random</option>
              <option value='zws'>Invisible</option>
              <option value='emoji'>Emoji</option>
            </Select>
            <Button size='sm' width='100' isDisabled={busy || !file} isLoading={busy} loadingText='Uploading' onClick={handleFileUpload} colorScheme='purple' leftIcon={<UploadIcon size={16}/>}>Upload</Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
}