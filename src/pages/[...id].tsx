import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import prisma from 'lib/prisma';
import { Center, Box, useColorModeValue, Heading, Button } from '@chakra-ui/react';
import Paste from 'components/Paste';
import getFile from '../../server/static';
import config from 'lib/config';
import { DownloadCloud } from 'react-feather';
import FileViewer from 'components/FileViewer';

export default function Embed({ file, title, color, username, content = '' }) {
  const src = `/raw/${file.fileName}`;
  const ext = file.fileName.split('.').pop();
  const bg = useColorModeValue('gray.100', 'gray.700');
  const fg = useColorModeValue('gray.800', 'white');
  const shadow = useColorModeValue('outline', 'dark-lg');
  const type = file.mimetype.split('/').shift();
  const handleDownload = () => {
    const a = document.createElement('a');
    a.download = file.origFileName;
    a.href = src;
    a.click();
  };
  return (
    <>
      <Head>
        {title ? (
          <>
            <meta property='og:site_name' content='Draconic'/>
            <meta property='og:title' content={title}/>
          </>
        ) : (
          <meta property='og:title' content='Draconic'/>
        )}
        <meta property='theme-color' content={color}/>
        <meta property='og:url' content={file.slug}/>
        <meta property='og:image' content={src}/>
        <meta property='twitter:card' content='summary_large_image'/>
        <title>{'Uploaded by ' + username}</title>
      </Head>
      <Center>
        <Box
          m={4}
          boxShadow='xl'
          flexDirection='column'
          bg={bg}
          fg={fg}
          p={1}
          borderRadius={5}
          textAlign='center'
          shadow={shadow}
        >
          <Heading mb={1} mx={2} fontSize='md'>{file.origFileName}</Heading>
          <FileViewer ext={ext} content={content} src={src} type={type} style={{ maxWidth: '90vw', maxHeight: '80vh' }}/>
          <Button mt={1} leftIcon={<DownloadCloud size={16}/>} colorScheme='purple' size='sm' onClick={handleDownload}>Download</Button>
        </Box>
      </Center>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = context.params.id[0];
  const file = await prisma.file.findFirst({
    where: {
      slug
    },
    select: {
      fileName: true,
      mimetype: true,
      origFileName: true,
      userId: true
    }
  });
  if (!file) return {
    notFound: true
  };
  const user = await prisma.user.findFirst({
    select: {
      embedTitle: true,
      embedColor: true,
      username: true
    },
    where: {
      id: file.userId
    }
  });
  if (file.mimetype.startsWith('text') || file.mimetype === 'application/json') {
    const content = await getFile(config.uploader.directory, file.fileName);
    if (!content) return { notFound: true };
    return {
      props: {
        file,
        title: user.embedTitle,
        color: user.embedColor,
        username: user.username,
        content: content.toString()
      }
    };
  };
  return {
    props: {
      file,
      title: user.embedTitle,
      color: user.embedColor,
      username: user.username
    }
  };
};
