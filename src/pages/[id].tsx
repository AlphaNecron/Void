// import { Box, Button, Center, Heading, Input, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import {
  ActionIcon,
  Button,
  Group,
  Image,
  PasswordInput,
  Popover,
  ScrollArea,
  Select,
  Stack,
  Table,
  Title,
  Tooltip
} from '@mantine/core';
import {showNotification} from '@mantine/notifications';
import {Prism} from '@mantine/prism';
import Container from 'components/Container';
import {readFileSync} from 'fs';
import {rm} from 'fs/promises';
import config from 'lib/config';
import {highlightLanguages} from 'lib/constants';
import {getType, isPreviewable, isText, isType} from 'lib/mime';
import prisma from 'lib/prisma';
import {parseByte} from 'lib/utils';
// import { ArrowRightCircle, DownloadCloud } from 'react-feather';
import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {resolve} from 'path';
import {Language} from 'prism-react-renderer';
// import FileViewer from 'components/FileViewer';
// import config from 'lib/config';
// import useFetch from 'lib/hooks/useFetch';
// import { languages } from 'lib/constants';
// import prisma from 'lib/prisma';
// import { bytesToHr } from 'lib/utils';
// import { GetServerSideProps } from 'next';
// import Head from 'next/head';
// import fetch from 'node-fetch';
import React, {useEffect, useState} from 'react';
import {BiNavigation} from 'react-icons/bi';
import {FiDownload, FiFlag, FiInfo} from 'react-icons/fi';
import {RiErrorWarningFill, RiFlag2Fill, RiNavigationFill} from 'react-icons/ri';

function CustomScrollArea({...props}) {
  return <ScrollArea style={{height: '66vh', width: '80vw'}} scrollbarSize={4} {...props}/>;
}

export function Preview({data: {isPrivate = false, buffer = '', properties, embed}}) {
  const [open, setOpen] = useState(false);
  if (isPrivate) return (
    <>
      <Head>
        <title>Private file</title>
      </Head>
      <Container>
        <Title m='xl' align='center' order={4}>This file is private, please log in to view.</Title>
      </Container>
    </>
  );
  const [lang, setLang] = useState(Object.values(highlightLanguages)[0][0]);
  const [mimetype, name] = [properties['Mimetype'], properties['File name']];
  const [content, setContent] = useState('');
  const detectLanguage = () => {
    const language = Object.entries(highlightLanguages).find(([_, y]) => y.slice(1).some(z => name.endsWith(z)));
    setLang(language ? language[1][0] : Object.values(highlightLanguages)[0][0]);
  };
  const [fileSource, setFileSource] = useState(`/api/file/${properties['ID']}`);
  const report = () => {
    fetch('/api/file/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: properties['ID']
      })
    }).then(r => r.json()).then(j => {
      if (j.success)
        showNotification({
          title: 'Reported the file to the staff.',
          icon: <RiFlag2Fill/>,
          message: '',
          color: 'green'
        });
    });
  };
  const a2b = (a) => {
    let b, c, d, e = {}, f = 0, g = 0, h = '', i = String.fromCharCode, j = a.length;
    for (b = 0; 64 > b; b++) e['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(b)] = b;
    for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; ) ((d = 255 & f >>> (g -= 8)) || j - 2 > c) && (h += i(d));
    return h;
  };
  useEffect(() => {
    if (buffer !== '') {
      if (['image', 'audio', 'video'].some(x => getType(mimetype) === x)) {
        const raw = a2b(buffer);
        const b = Uint8Array.from(raw.split('').map(x => x.charCodeAt(0)));
        const blob = new Blob([b], {type: mimetype});
        setFileSource(URL.createObjectURL(blob));
      } else if (isType('text', mimetype)) setContent(a2b(buffer));
    } else fetch(fileSource).then(r => r.text()).then(setContent);
    if (isText(mimetype)) detectLanguage();
  }, []);
  const buildOEmbedUrl = (author: string, authorUrl: string, siteName: string, siteNameUrl: string): string => {
    if (typeof window === 'undefined') return;
    const url = new URL('/api/oembed', window.location.origin);
    if (author) url.searchParams.set('author', author);
    if (authorUrl) url.searchParams.set('authorUrl', authorUrl);
    if (siteName) url.searchParams.set('siteName', siteName);
    if (siteNameUrl) url.searchParams.set('siteNameUrl', siteNameUrl);
    return url.toString();
  };
  return (
    <>
      <Head>
        <title>{name}</title>
        {embed && (
          <>
            <meta property='og:title' content={embed.title}/>
            <meta property='og:description' content={embed.description}/>
            <meta property='theme-color' content={embed.color}/>
            <link type='application/json+oembed' href={buildOEmbedUrl(embed.author, embed.authorUrl, embed.siteName, embed.siteNameUrl)}/>
            {buffer !== '' ||
            isType('image', mimetype) ? (
                <>
                  <meta property='og:image' content={fileSource}/>
                  <meta property='twitter:card' content='summary_large_image'/>
                </>
              ) : isType('video', mimetype) ? (
                <>
                  <meta property='og:type' content='video.other'/>
                  <meta property='og:video' content={fileSource}/>
                  <meta property='og:video:url' content={fileSource}/>
                  <meta property='og:video:secure_url' content={fileSource}/>
                  <meta property='og:video:type' content={mimetype}/>
                </>
              ) : (
                <meta property='og:image' content='/logo.png'/>
              )}
          </>
        )}
      </Head>
      <Container style={{ position: 'relative' }}>
        <Group style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 100 }} spacing={4}>
          <Popover position='top' opened={open} target={
            <Tooltip label='View properties'>
              <ActionIcon onClick={() => setOpen(o => !o)} variant='filled' color='blue'>
                <FiInfo/>
              </ActionIcon>
            </Tooltip>
          }>
            <Table highlightOnHover striped>
              <tbody>
                {Object.entries(properties).map(([x, y], i) =>
                  <tr key={i}>
                    <td>{x}</td>
                    <td>{y}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Popover>
          {buffer !== '' || (
            <ActionIcon component='a' href={fileSource} download={properties['File name']} variant='filled' color='green'>
              <FiDownload/>
            </ActionIcon>
          )}
          <ActionIcon onClick={report} variant='filled' color='red'>
            <FiFlag/>
          </ActionIcon>
        </Group>
        {isPreviewable(mimetype) && (
          isType('image', mimetype) ? (
            <Image alt={name} onLoad={() => buffer === '' || URL.revokeObjectURL(fileSource)} height='88vh' src={fileSource} fit='contain'/>
          ) : isType('audio', mimetype) ? (
            <audio onLoad={() => buffer === '' || URL.revokeObjectURL(fileSource)} src={fileSource} autoPlay controls/>
          ) : isType('video', mimetype) ? (
            <video onLoad={() => buffer === '' || URL.revokeObjectURL(fileSource)} style={{maxHeight: '60vh'}} src={fileSource} autoPlay
              controls/>
          ) : isText(mimetype) ? (
            <Stack>
              <Select value={lang} onChange={setLang} variant='default' allowDeselect={false} creatable={false}
                clearable={false}
                data={Object.entries(highlightLanguages).map(([label, lang]) => ({label, value: lang[0]}))}/>
              <Prism color='blue' withLineNumbers scrollAreaComponent={CustomScrollArea}
                language={lang as Language}>{content}</Prism>
            </Stack>
          ) : <Title align='center' order={5}>This file cannot be previewed.</Title>
        )}
      </Container>
    </>
  );
}

export function Url({id}) {
  const [password, setPassword] = useState<string>('');
  const router = useRouter();
  const validate = () =>
    fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        password
      })
    }).then(r => r.json()).then(r => {
      if (r.error)
        return showNotification({title: r.error, message: '', color: 'red', icon: <RiErrorWarningFill/>});
      showNotification({title: 'Redirecting...', message: '', color: 'green', icon: <RiNavigationFill/>});
      router.push(r.destination);
    });
  return (
    <>
      <Head>
        <title>Protected URL</title>
      </Head>
      <Container p={64}>
        <Title mb='xl' order={4}>This URL is password-protected, please enter a password to continue.</Title>
        <div style={{display: 'flex'}}>
          <PasswordInput onKeyPress={e => e.key === 'Enter' && validate()} value={password}
            onChange={e => setPassword(e.target.value)} style={{flex: 1}} autoComplete='off'/>
          <ActionIcon type='submit' onClick={validate} variant='filled' size='lg' mt={1} color='green' ml={4}>
            <BiNavigation/>
          </ActionIcon>
        </div>
      </Container>
    </>
  );
}

export default function Handler({type, data}) {
  return type === 'url' ? <Url id={data.id}/> : <Preview data={data}/>;
}

export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
  let buffer;
  const file = await prisma.file.findUnique({
    where: {
      slug: query.id.toString()
    },
    include: {
      user: true
    }
  });
  if (!file) {
    const url = await prisma.url.findUnique({
      where: {
        short: query.id.toString()
      }
    });
    if (!url)
      return {notFound: true};
    if (!url.password)
      return {
        redirect: {
          destination: url.destination
        },
        props: {}
      };
    await prisma.url.update({
      where: {
        id: url.id
      },
      data: {
        views: {
          increment: 1
        }
      }
    });
    return {
      props: {
        type: 'url',
        data: {
          id: url.id,
          password: true
        }
      }
    };
  }
  const { embedEnabled, embedTitle, embedSiteName, embedSiteNameUrl, embedColor, embedDescription, embedAuthor, embedAuthorUrl } = file.user;
  const replace = (text: string) =>
    text ? text.replace(/{{filename}}/ig, file.fileName)
      .replace(/{{id}}/ig, file.id)
      .replace(/{{date}}/ig, file.uploadedAt.toLocaleDateString())
      .replace(/{{time}}/ig, file.uploadedAt.toLocaleTimeString())
      .replace(/{{datetime}}/ig, file.uploadedAt.toLocaleString())
      .replace(/{{mimetype}}/ig, file.mimetype)
      .replace(/{{size}}/ig, parseByte(Number(file.size)))
      .replace(/{{username}}/ig, file.user.name) : null;
  if (file.isPrivate) {
    const session = await getSession({req});
    if (!session)
      return {
        props: {
          isPrivate: true
        }
      };
  }
  if (file.isExploding) {
    const path = resolve(config.void.file.outputDirectory, file.user.id, file.id);
    buffer = readFileSync(path).toString('base64');
    await prisma.file.delete({
      where: {
        id: file.id,
      }
    });
    await rm(path);
  } else {
    await prisma.file.update({
      where: {
        id: file.id
      },
      data: {
        views: {
          increment: 1
        }
      }
    });
  }
  return {
    props: {
      type: 'file',
      data: {
        ...(buffer && {buffer}),
        properties: {
          'ID': file.id,
          'File name': file.fileName,
          'Mimetype': file.mimetype,
          'Size': parseByte(Number(file.size)),
          'Uploaded at': file.uploadedAt.toLocaleString(),
          'Views': file.views,
          'Uploaded by': file.user.name || 'Anonymous'
        },
        embed: {
          enabled: embedEnabled,
          siteName: replace(embedSiteName),
          siteNameUrl: embedSiteNameUrl,
          title: replace(embedTitle),
          color: embedColor,
          description: replace(embedDescription),
          author: replace(embedAuthor),
          authorUrl: embedAuthorUrl,
          slug: query.id.toString()
        }
      }
    }
  };
};
