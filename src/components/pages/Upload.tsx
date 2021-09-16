import React, { useState } from 'react';
import { useToast, useColorModeValue, Box, Button, Flex, Heading, HStack, Icon, Select, Spacer, VStack, Text } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import { useStoreSelector } from 'lib/redux/store';
import Dropzone from 'react-dropzone';
import { Upload as UploadIcon } from 'react-feather';

export default function Upload() {
  const { token } = useStoreSelector(state => state.user);
  const toast = useToast();
  const [generator, setGenerator] = useState('random');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const showToast = (srv, title, content) => {
    toast({
      title: title,
      description: content,
      status: srv,
      duration: 5000,
      isClosable: true,
    });
  };
  const handleFileUpload = async () => {
    try {
      const body = new FormData();
      body.append('file', file);
      setLoading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Token': token,
          'Generator': generator
        },
        body
      });
      const json = await res.json();
      if (res.ok && !json.error) {
        showToast('success', 'File uploaded', json.url);
        let hasCopied = copy(json.url);
        if (hasCopied) {
          showToast('info', 'Copied the URL to your clipboard', null);
        }
      } else {
        showToast('error', 'Couldn\'t upload the file', json.error);
      }
    }
    catch (error) {
      showToast('error', 'Error while uploading the file', error.message);
    }
    finally {
      setLoading(false);
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
          <Button m={2} variant='ghost' minWidth='300' maxWidth='350' minHeight='200'>
            <Dropzone disabled={loading} onDrop={acceptedFiles => setFile(acceptedFiles[0])}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <VStack {...getRootProps()}>
                  <input {...getInputProps()}/>
                  <UploadIcon size={56}/>
                  {isDragActive ? (
                    <Text fontSize='xl'>Drop the file here</Text>
                  ) : (
                    <Text fontSize='xl'>Drag a file here or click to upload one</Text>
                  )}
                  <Text fontSize='lg' colorScheme='yellow' isTruncated maxWidth='325'>{file && file.name}</Text>
                </VStack>
              )}
            </Dropzone>
          </Button>
          <HStack justify='stretch' minWidth='300' maxWidth='350'>
            <Select size='sm' variant='filled' maxWidth='150' value={generator} onChange={selection => setGenerator(selection.target.value)}>
              <option value='random'>Random</option>
              <option value='zws'>Invisible</option>
              <option value='emoji'>Emoji</option>
            </Select>
            <Button size='sm' width='full' isDisabled={loading || !file} isLoading={loading} loadingText='Uploading' onClick={handleFileUpload} colorScheme='purple' leftIcon={<UploadIcon size={16}/>}>Upload</Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
}