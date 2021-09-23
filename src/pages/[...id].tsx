import { Box, Button, Center, Heading, useColorModeValue } from '@chakra-ui/react';
import FileViewer from 'components/FileViewer';
import config from 'lib/config';
import languages from 'lib/languages';
import prisma from 'lib/prisma';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import fetch from 'node-fetch';
import React from 'react';
import { DownloadCloud } from 'react-feather';

export default function Embed({ file, title, color, username, content = '', misc }) {
  const bg = useColorModeValue('gray.100', 'gray.700');
  const fg = useColorModeValue('gray.800', 'white');
  const shadow = useColorModeValue('outline', 'dark-lg');
  const handleDownload = () => {
    const a = document.createElement('a');
    a.download = file.origFileName;
    a.href = misc.src;
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
        {misc.type === 'image' ? (
          <>
            <meta property='og:image' content={misc.src}/>
            <meta property='twitter:card' content='summary_large_image'/>
          </>
        ) : misc.type === 'video' ? (
          <>
            <meta property='og:type' content='video.other'/>
            <meta property='og:video' content={misc.src}/>
            <meta property='og:video:url' content={misc.src}/>
            <meta property='og:video:secure_url' content={misc.src}/>
            <meta property='og:video:type' content={file.mimetype}/>
          </>
        ) : (
          <meta property='og:image' content='/logo.png'/>
        )}
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
          <FileViewer ext={misc.ext} content={content} src={misc.src} type={misc.type} language={misc.language} style={{ maxWidth: '90vw', maxHeight: '80vh' }}/>
          <Button m={1} leftIcon={<DownloadCloud size={16}/>} colorScheme='purple' size='sm' onClick={handleDownload}>Download</Button>
        </Box>
      </Center>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const slug = context.params.id[0];
  const file = await prisma.file.findFirst({
    where: {
      slug
    },
    select: {
      id: true,
      fileName: true,
      mimetype: true,
      origFileName: true,
      userId: true
    }
  });
  if (!file) return {
    notFound: true
  };
  await prisma.file.update({
    where: {
      id: file.id,
    },
    data: {
      views: {
        increment: 1
      }
    }
  });
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
  const ext = file.fileName.split('.').pop();
  const type = file.mimetype.split('/').shift();
  const src = `/r/${file.fileName}`;
  const isCode = Object.keys(languages).some(name => languages[name] === ext);
  if (file.mimetype.startsWith('text') || isCode) {
    const res = await fetch(`http${config.core.secure ? 's' : ''}://${context.req.headers.host}/r/${file.fileName}`);
    if (!res.ok) return { notFound: true };
    const content = await res.text();
    return {
      props: {
        file,
        title: user.embedTitle,
        color: user.embedColor,
        username: user.username,
        misc: {
          ext,
          type,
          language: isCode ? ext : 'text'
        },
        content
      }
    };
  };
  return {
    props: {
      file,
      title: user.embedTitle,
      color: user.embedColor,
      username: user.username,
      misc: {
        ext,
        type,
        src
      }
    }
  };
};
