import { ButtonGroup, Heading, IconButton, Link, Spacer, Tooltip, useColorModeValue, VStack } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import React from 'react';
import { Copy, ExternalLink, Trash2 } from 'react-feather';
import FileViewer from './FileViewer';

export default function FileCard({ file, onDelete, ...other }) {
  const bg = useColorModeValue('gray.100', 'gray.700');
  const shadow = useColorModeValue('outline', 'dark-lg');
  return (
    <VStack borderRadius={4} minWidth='150' maxWidth='250' maxHeight='275' p={2} shadow={shadow} bg={bg} {...other}>
      <FileViewer src={file.rawUrl} ext={file.fileName.split('.').pop()} type={file.mimetype.split('/')[0]} autoPlay={false} controls={false} style={{ maxHeight: '180px' }}/>
      <Spacer/>
      <Tooltip hasArrow label={
        <>
          <p>ID: {file.id}</p>
          <p>File name: {file.fileName}</p>
          <p>{file.origFileName === file.fileName ? '' : `Original file name: ${file.origFileName}`}</p>
          <p>Views: {file.views}</p>
          <p>Type: {file.mimetype}</p>
          <p>Uploaded at: {new Date(file.uploadedAt).toLocaleString()}</p>
        </>
      } bg='gray.600' color='white'>
        <Heading size='sm' maxWidth='140' isTruncated>{file.origFileName}</Heading>
      </Tooltip>
      <ButtonGroup>
        <IconButton aria-label='Delete' size='sm' colorScheme='red' variant='ghost' onClick={() => onDelete(file)} icon={<Trash2 size={16}/>}/>
        <Link href={file.url} isExternal>
          <IconButton aria-label='Open in new tab' size='sm' colorScheme='purple' variant='ghost' icon={<ExternalLink size={16}/>}/>
        </Link>
        <IconButton aria-label='Copy link' size='sm' colorScheme='purple' onClick={() => copy(file.url)} variant='ghost' icon={<Copy size={16}/>}/>
      </ButtonGroup>
    </VStack>
  );
}