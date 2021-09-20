import { Center, Heading, Image } from '@chakra-ui/react';
import React from 'react';
import Paste from './Paste';

export default function FileViewer({ content = undefined, src = undefined, ext, type, autoPlay = true, controls = true, ...other}) {
  return (
    <Center>
      {type === 'image' ? (
        <Image src={src} alt={src} {...other}/>
      ) : type === 'video' ? (
        <video src={src} autoPlay={autoPlay} controls={controls} {...other}/>
      ) : type === 'audio' ? (
        <audio src={src} autoPlay={autoPlay} controls={controls} {...other}/>
      ) : content ? (
        <Paste content={content} ext={ext} {...other}/>
      ) : (
        <Heading fontSize='lg' m={6}>This file can&#39;t be previewed.</Heading>
      )
      }
    </Center>
  );
}