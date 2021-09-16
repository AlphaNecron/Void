import React from 'react';
import { Heading } from '@chakra-ui/react';

export default function FileViewer({ src, type }) {
  switch (type) {
  case 'image': {
    return <img src={src} alt={src}/>;
  }
  case 'video': {
    return <video src={src} autoPlay={true} controls={true}/>;
  }
  case 'audio': {
    return <audio src={src} autoPlay={true} controls={true}/>;
  }
  default: {
    return <Heading fontSize='lg' m={6}>This file can&#39;t be previewed.</Heading>;
  }
  }
}