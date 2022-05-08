import {
  ActionIcon,
  Button,
  Dialog,
  Group,
  Image,
  Modal,
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import {useDisclosure, useInputState} from '@mantine/hooks';
import {showNotification} from '@mantine/notifications';
import {Prism} from '@mantine/prism';
import Container from 'components/Container';
import {highlightLanguages} from 'lib/constants';
import {isPreviewable, isText, isType} from 'lib/mime';
import prisma from 'lib/prisma';
import {parseByte} from 'lib/utils';
import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {Language} from 'prism-react-renderer';
import React, {useEffect, useState} from 'react';
import {BiNavigation} from 'react-icons/bi';
import {FiDownload, FiFlag, FiInfo, FiSend} from 'react-icons/fi';
import {RiErrorWarningFill, RiFlag2Fill, RiNavigationFill} from 'react-icons/ri';
import {VscWordWrap} from 'react-icons/vsc';

export function Preview({data: {isPrivate = false, isExploding = false, properties, embed}}) {
  const [open, handler] = useDisclosure(false);
  const [dialogOpen, dHandler] = useDisclosure(false);
  console.log(isExploding);
  if (isPrivate) return (
    <>
      <Head>
        <title>🔒 Private file</title>
      </Head>
      <Container>
        <Title m='xl' align='center' order={4}>This file is private, please log in to view.</Title>
      </Container>
    </>
  );
  const [lang, setLang] = useState(Object.values(highlightLanguages)[0][0]);
  const [mimetype, name] = [properties['Mimetype'], properties['File name']];
  const [wrap, setWrap] = useState(false);
  const [reportReason, setReportReason] = useInputState('');
  const [content, setContent] = useState('');
  const detectLanguage = () => {
    const language = Object.values(highlightLanguages).find(x => x.slice(1).some(z => name.endsWith(z)));
    setLang(lang => language ? language[0] : lang);
  };
  const src = () => `/api/file/${properties['ID']}`;
  const report = () => {
    if (reportReason.length <= 3) return;
    fetch('/api/file/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: properties['ID'],
        reason: reportReason
      })
    }).then(r => r.json()).then(j => {
      if (j.success)
        showNotification({
          title: 'Reported the file.',
          icon: <RiFlag2Fill/>,
          message: '',
          color: 'green'
        });
    });
    setReportReason('');
    dHandler.close();
  };
  useEffect(() => {
    if (isText(mimetype)) {
      fetch(src()).then(r => r.text()).then(setContent);
      detectLanguage();
    }
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
  const actions = (fluid = false, float = true) => (
    <Group position='apart' grow={fluid} style={fluid || !float ? ({}) : ({ position: 'absolute', bottom: 24, right: 24, zIndex: 100 })} spacing={4}>
      {fluid ? (
        <Button color='blue' onClick={handler.open} leftIcon={<FiInfo/>}>Info</Button>
      ) : (
        <Tooltip label='View properties'>
          <ActionIcon onClick={handler.open} variant='filled' color='blue'>
            <FiInfo/>
          </ActionIcon>
        </Tooltip>
      )
      }
      {isExploding || (fluid ? (
        <Button color='green' component='a' href={src()} download={properties['File name']} leftIcon={<FiDownload/>}>
            Download
        </Button>
      ) : (
        <Tooltip label='Download'>
          <ActionIcon component='a' href={src()} download={properties['File name']} variant='filled' color='green'>
            <FiDownload/>
          </ActionIcon>
        </Tooltip>
      ))}
      {fluid ? (
        <Button onClick={dHandler.open} color='red' leftIcon={<FiFlag/>}>
          Report
        </Button>
      ) : (
        <Tooltip label='Report this file'>
          <ActionIcon onClick={dHandler.open} variant='filled' color='red'>
            <FiFlag/>
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
  return (
    <>
      <Head>
        <title>{isExploding ? '💣' : ''} {name}</title>
        {embed && (
          <>
            <meta property='og:title' content={embed.title}/>
            <meta property='og:description' content={embed.description}/>
            <meta property='theme-color' content={embed.color}/>
            <link type='application/json+oembed' href={buildOEmbedUrl(embed.author, embed.authorUrl, embed.siteName, embed.siteNameUrl)}/>
            {isExploding ||
            isType('image', mimetype) ? (
                <>
                  <meta property='og:image' content={src()}/>
                  <meta property='twitter:card' content='summary_large_image'/>
                </>
              ) : isType('video', mimetype) ? (
                <>
                  <meta property='og:type' content='video.other'/>
                  <meta property='og:video' content={src()}/>
                  <meta property='og:video:url' content={src()}/>
                  <meta property='og:video:secure_url' content={src()}/>
                  <meta property='og:video:type' content={mimetype}/>
                </>
              ) : (
                <meta property='og:image' content='/logo.png'/>
              )}
          </>
        )}
      </Head>
      <Modal title='File information' transition='slide-up' opened={open} onClose={handler.close} centered>
        <Table highlightOnHover striped>
          <tbody>
            {Object.entries(properties).map(([x, y], i) =>
              <tr key={i}>
                <td>
                  <strong>
                    {x}
                  </strong>
                </td>
                <td>{y}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal>
      <Dialog
        opened={dialogOpen}
        withCloseButton
        transition='slide-left'
        onClose={dHandler.close}
        size='lg'
        radius='md'
      >
        <Stack>
          <Text size='xs' color='dimmed' weight={700}>
          Why do you want to report this file?
          </Text>
          <TextInput value={reportReason} error={reportReason.length <= 3 ? 'Please provide a proper reason!' : null} onChange={setReportReason}/>
          <Button size='xs' color='red' disabled={reportReason.length <= 3} onClick={report} leftIcon={<FiSend/>}>Submit report</Button>
        </Stack>
      </Dialog>
      <Container style={{ position: 'relative' }}>
        {isPreviewable(mimetype) ? (
          isType('image', mimetype) ? (
            <>
              {actions()}
              <Image alt={name} src={src()} styles={{
                image: {
                  objectFit: 'contain',
                  maxWidth: '80vw',
                  maxHeight: '80vh'
                }
              }}/>
            </>
          ) : isType('audio', mimetype) ? (
            <>
              {actions()}
              <audio src={src()} autoPlay controls/>
            </>
          ) : isType('video', mimetype) ? (
            <>
              {actions()}
              <video style={{maxHeight: '60vh'}} src={src()} autoPlay
                controls/>
            </>
          ) : isText(mimetype) ? (
            <Stack>
              <div style={{ display: 'flex' }}>
                <Select size='xs' searchable value={lang} onChange={setLang} style={{ flex: 1 }} variant='default' allowDeselect={false} creatable={false}
                  clearable={false} mr={4}
                  data={Object.entries(highlightLanguages).map(([label, lang]) => ({label, value: lang[0]}))}/>
                <Group spacing={4}>
                  <Tooltip label='Toggle word wrap'>
                    <ActionIcon variant='filled' color={wrap ? 'void1' : 'gray'} onClick={() => setWrap(w => !w)}>
                      <VscWordWrap/>
                    </ActionIcon>
                  </Tooltip>
                  {actions(false, false)}
                </Group>
              </div>
              <Prism withLineNumbers styles={
                {
                  scrollArea: {
                    height: '66vh',
                    width: '66vw'
                  },
                  ...(wrap && {
                    code: {
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }
                  })
                }}
              language={lang as Language}>{content}</Prism>
            </Stack>
          ) : <></>) : (
          <Stack>
            <Title align='center' m={48} order={3}>This file cannot be previewed.</Title>
            {actions(true)}
          </Stack>
        )
        }
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
          <PasswordInput onKeyDown={e => e.key === 'Enter' && validate()} value={password}
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
          data: {
            isPrivate: true
          }
        }
      };
  }
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
  return {
    props: {
      type: 'file',
      data: {
        isExploding: file.isExploding,
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
