import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import prisma from 'lib/prisma';
import { Box, Flex, useColorModeValue, Heading, Button } from '@chakra-ui/react';
import FileViewer from 'components/FileViewer';

export default function Embed({ file, title, color, username }) {
  const fileUrl = `/raw/${file.fileName}`;
  const bg = useColorModeValue('gray.100', 'gray.700');
  const fg = useColorModeValue('gray.800', 'white');
  const shadow = useColorModeValue('outline', 'dark-lg');
  const handleDownload = () => {
    const a = document.createElement('a');
    a.download = file.fileName;
    a.href = fileUrl;
    a.click();
  };
  return (
    <>
      <Head>
        {title ? (
          <>
            <meta property='og:site_name' content='Axtral'/>
            <meta property='og:title' content={title}/>
          </>
        ) : (
          <meta property='og:title' content='Axtral'/>
        )}
        <meta property='theme-color' content={color}/>
        <meta property='og:url' content={file.slug}/>
        <meta property='twitter:card' content='summary_large_file'/>
        <title>{'Uploaded by ' + username}</title>
      </Head>
      <Flex minHeight='92%' width='full' align='center' justifyContent='center'>
        <Box
          m={4}
          boxShadow='xl'
          bg={bg}
          fg={fg}
          justify='center'
          align='center'
          p={1}
          maxWidth='72%' maxHeight='67%'
          borderRadius={5}
          textAlign='center'
          shadow={shadow}
        >
          <Heading mb={1} fontSize='md'>{file.fileName}</Heading>
          <FileViewer type={file.mimetype.split('/')[0]}  src={fileUrl}/>
          <Button mt={1} colorScheme='purple' size='sm' onClick={handleDownload}>Download</Button>
        </Box>
      </Flex>
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

  return {
    props: {
      file,
      title: user.embedTitle,
      color: user.embedColor,
      username: user.username
    }
  };
};
