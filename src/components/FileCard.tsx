import { VStack, Spacer, Heading, HStack, Link, useColorModeValue, IconButton, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { Trash2, ExternalLink, Copy } from 'react-feather';
import FileViewer from './FileViewer';
import copy from 'copy-to-clipboard';

export default function FileCard({ file, onClick, onDelete, ...other }) {
  const bg = useColorModeValue('gray.100', 'gray.700');
  const shadow = useColorModeValue('outline', 'dark-lg');
  return (
    <VStack borderRadius={4} minWidth='150px' maxWidth='250px' maxHeight='275px' p={2} shadow={shadow} bg={bg} {...other}>
      <FileViewer src={file.rawUrl} ext={file.fileName.split('.').pop()} type={file.mimetype.split('/')[0]} autoPlay={false} controls={false} style={{ maxHeight: '180px' }}/>
      <Spacer/>
      <Tooltip shouldWrapChildren hasArrow label={
        <>
          <p>{`File name: ${file.fileName}`}</p>
          <p>{file.origFileName === file.fileName ? '' : `Original file name: ${file.origFileName}`}</p>
          <p>{`Uploaded at: ${new Date(file.uploadedAt).toLocaleString()}`}</p>
        </>
      } bg='gray.600' color='white'>
        <Heading size='sm' maxWidth='150px' isTruncated>{file.origFileName}</Heading>
      </Tooltip>
      <HStack horizontalAlign='right'>
        <IconButton aria-label='Delete' size='sm' colorScheme='red' variant='ghost' onClick={() => onDelete(file)} icon={<Trash2 size={16}/>}/>
        <Link href={file.url} isExternal>
          <IconButton aria-label='Open in new tab' size='sm' colorScheme='purple' variant='ghost' icon={<ExternalLink size={16}/>}/>
        </Link>
        <IconButton aria-label='Copy link' size='sm' colorScheme='purple' onClick={() => copy(file.url)} variant='ghost' icon={<Copy size={16}/>}/>
      </HStack>
    </VStack>
  );
}