import { ButtonGroup, IconButton, Link, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import React from 'react';
import { Copy, ExternalLink, Trash2 } from 'react-feather';
import FileViewer from './FileViewer';

export default function FileList({ files, onDelete, filter }) {
  return (
    <Table variant='simple' size='md'>
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Thumbnail</Th>
          <Th>File name</Th>
          <Th>Original file name</Th>
          <Th>Views</Th>
          <Th>File type</Th>
          <Th>Uploaded at</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {files && (files.map((file, i) =>
          ([file.fileName, file.origFileName].some(name => name.toLowerCase().includes(filter))) && (
            <Tr key={i}>
              <Td>{file.id}</Td>
              <Td>
                {['video', 'image'].some(t => file.mimetype.startsWith(t)) ? (
                  <FileViewer src={file.rawUrl} ext={file.fileName.split('.').pop()} type={file.mimetype.split('/')[0]} autoPlay={false} controls={false} style={{ maxHeight: '25px', maxWidth: '40px' }}/>
                ) : (
                  <Text>None</Text>
                )}
              </Td>
              <Td>{file.fileName}</Td>
              <Td>{file.origFileName === file.fileName ? '' : file.origFileName}</Td>
              <Td>{file.views}</Td>
              <Td>{file.mimetype}</Td>
              <Td>{new Date(file.uploadedAt).toLocaleString()}</Td>
              <Td>
                <ButtonGroup>
                  <IconButton aria-label='Delete' size='sm' colorScheme='red' onClick={() => onDelete(file)} icon={<Trash2 size={16}/>}/>
                  <Link href={file.url} isExternal>
                    <IconButton aria-label='Open in new tab' size='sm' colorScheme='purple' icon={<ExternalLink size={16}/>}/>
                  </Link>
                  <IconButton aria-label='Copy link' size='sm' colorScheme='purple' onClick={() => copy(file.url)} icon={<Copy size={16}/>}/>
                </ButtonGroup>
              </Td>
            </Tr>
          )
        )
        )}
      </Tbody>
    </Table>
  );
}