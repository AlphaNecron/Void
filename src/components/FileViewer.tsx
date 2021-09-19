import { Center, Heading } from '@chakra-ui/layout';
import React from 'react';
import Paste from './Paste';

export default function FileViewer({ content = undefined, src = undefined, ext, type, ...other}) {
  return (
    <Center>
      {type === 'image' ? (
        <img src={src} alt={src} {...other}/>
      ) : type === 'video' ? (
        <video src={src} autoPlay controls {...other}/>
      ) : type === 'audio' ? (
        <audio src={src} autoPlay controls {...other}/>
      ) : content ? (
        <Paste content={content} ext={ext} {...other}/>
      ) : (
        <Heading fontSize='lg' m={6}>This file can&#39;t be previewed.</Heading>
      )
      }
    </Center>
  );
}