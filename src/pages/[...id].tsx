import { Box, Button, Center, Heading, useColorModeValue } from '@chakra-ui/react';
import FileViewer from 'components/FileViewer';
import config from 'lib/config';
import languages from 'lib/languages';
import prisma from 'lib/prisma';
import { bytesToHr } from 'lib/utils';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import fetch from 'node-fetch';
import React from 'react';
import { DownloadCloud } from 'react-feather';

export default function Embed({ file, embed, username, content = undefined, misc }) {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.download = file.origFileName;
    a.href = misc.src;
    a.click();
  };
  const replace = text => {
    const time = new Date(file.uploadedAt);
    return (text ?? '').replace(/{size}/ig, misc.size)
      .replace(/{filename}/ig, file.fileName)
      .replace(/{orig}/ig, file.origFileName)
      .replace(/{date}/ig, time.toLocaleDateString())
      .replace(/{time}/ig, time.toLocaleTimeString())
      .replace(/{author}/ig, username);
  };
  return (
    <>
      <Head>
        {embed.enabled && (
          <>
            <meta property='og:site_name' content={replace(embed.siteName)}/>
            <meta property='og:title' content={replace(embed.title)}/>
            <meta property='og:description' content={replace(embed.desc)}/>
            <meta property='theme-color' content={embed.color}/>
            <meta property='og:url' content={`/${file.slug}`}/>
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
          </>
        )}
        <title>Uploaded by {username}</title>
      </Head>
      <Center>
        <Box
          m={4}
          boxShadow='xl'
          flexDirection='column'
          bg={useColorModeValue('gray.100', 'gray.700')}
          fg={useColorModeValue('gray.800', 'white')}
          p={1}
          borderRadius={5}
          textAlign='center'
          shadow={useColorModeValue('outline', 'dark-lg')}
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
  if (slug === config.shortener.route.split('/').pop()) {
    const short = context.params.id[1];
    const url = await prisma.url.findFirst({
      where: {
        short
      },
      select: {
        id: true,
        destination: true
      }
    });
    if (!url) return { notFound: true };
    await prisma.url.update({
      where: {
        id: url.id,
      },
      data: {
        views: {
          increment: 1
        }
      }
    });
    return {
      redirect: {
        destination: url.destination,
      },
      props: undefined,
    };
  }
  const file = await prisma.file.findFirst({
    where: {
      slug
    },
    select: {
      id: true,
      fileName: true,
      mimetype: true,
      uploadedAt: true,
      slug: true,
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
  const { useEmbed: enabled, embedSiteName: siteName, embedTitle: title, embedColor: color, embedDesc: desc, username } = await prisma.user.findFirst({
    where: {
      id: file.userId
    },
    select: {
      username: true,
      useEmbed: true,
      embedSiteName: true,
      embedTitle: true,
      embedColor: true,
      embedDesc: true
    }
  });
  const ext = file.fileName.split('.').pop();
  const type = file.mimetype.split('/').shift();
  const src = `${config.uploader.raw_route}/${file.fileName}`;
  const url = `http${config.core.secure ? 's' : ''}://${context.req.headers.host}/${config.uploader.raw_route}`;
  const isCode = Object.keys(languages).some(name => languages[name] === ext);
  if (file.mimetype.startsWith('text') || isCode) {
    const res = await fetch(`${url}/${file.fileName}`);
    if (!res.ok) return { notFound: true };
    const content = await res.text();
    const size = bytesToHr(res.headers.get('content-length'));
    return {
      props: {
        file,
        embed: {
          enabled,
          siteName,
          title,
          color,
          desc
        },
        username,
        misc: {
          ext,
          type,
          language: isCode ? ext : 'text',
          size
        },
        content
      }
    };
  };
  const size = bytesToHr((await fetch(`${url}/${file.fileName}`)).headers.get('content-length'));
  return {
    props: {
      file,
      embed: {
        enabled,
        siteName,
        title,
        color,
        desc
      },
      username,
      misc: {
        ext,
        type,
        src,
        size
      }
    }
  };
};
