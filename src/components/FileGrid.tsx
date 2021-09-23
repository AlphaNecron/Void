import { SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import FileCard from './FileCard';

export default function FileGrid({ files, onDelete, filter }) {
  return (
    <SimpleGrid minChildWidth='150px' spacing='10px' mx={1}>
      {files && (files.map((file, i) =>
        (['video', 'image'].some(t => file.mimetype.startsWith(t)) && [file.fileName, file.origFileName].some(name => name.toLowerCase().includes(filter))) && (
          <FileCard file={file} m={2} key={i} onDelete={onDelete}/>
        )
      ))}
    </SimpleGrid>
  );
}