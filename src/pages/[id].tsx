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
import {Prism} from '@mantine/prism';
import AudioPlayer from 'components/AudioPlayer';
import Container from 'components/Container';
import ResponsiveButton from 'components/ResponsiveButton';
import VideoPlayer from 'components/VideoPlayer';
import {format} from 'fecha';
import {withIronSessionSsr} from 'iron-session/next';
import {highlightLanguages} from 'lib/constants';
import useRequest from 'lib/hooks/useRequest';
import {isPreviewable, isType} from 'lib/mime';
import {showError, showSuccess} from 'lib/notification';
import prisma from 'lib/prisma';
import {prettyBytes} from 'lib/utils';
import {ironOptions} from 'middleware/withVoid';
import {GetServerSideProps} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {Language} from 'prism-react-renderer';
import {useEffect, useState} from 'react';
import {BiNavigation} from 'react-icons/bi';
import {FiDownload, FiFlag, FiInfo, FiSend} from 'react-icons/fi';
import {RiErrorWarningFill, RiFlag2Fill, RiNavigationFill} from 'react-icons/ri';
import {VscWordWrap} from 'react-icons/vsc';

export function Preview({data: {isPrivate = false, isExploding = false, properties, embed}}) {
  const [open, handler] = useDisclosure(false);
  const [dialogOpen, dHandler] = useDisclosure(false);
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
        showSuccess('Reported the file.', <RiFlag2Fill/>);
    });
    setReportReason('');
    dHandler.close();
  };
  useEffect(() => {
    if (isType('text', mimetype)) {
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
    <Group position='apart' grow={fluid}
      style={fluid || !float ? ({}) : ({position: 'absolute', bottom: 24, right: 24, zIndex: 100})} spacing={4}>
      <ResponsiveButton color='blue' onClick={handler.open} icon={<FiInfo/>} condition={fluid} label='Info'/>
      {isExploding ||
        <ResponsiveButton color='green' component='a' condition={fluid} href={src()} download={properties['File name']}
          label='Download' icon={<FiDownload/>}/>}
      <ResponsiveButton onClick={dHandler.open} color='red' icon={<FiFlag/>} label='Report' condition={fluid}/>
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
            <link type='application/json+oembed'
              href={buildOEmbedUrl(embed.author, embed.authorUrl, embed.siteName, embed.siteNameUrl)}/>
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
                <td style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 200}}>{y}</td>
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
          <TextInput value={reportReason} error={reportReason.length <= 3 ? 'Please provide a proper reason!' : null}
            onChange={setReportReason}/>
          <Button size='xs' color='red' disabled={reportReason.length <= 3} onClick={report} leftIcon={<FiSend/>}>Submit
            report</Button>
        </Stack>
      </Dialog>
      <Container style={{position: 'relative', minWidth: 150}}>
        {isPreviewable(mimetype) ? (
          isType('image', mimetype) ? (
            <>
              {actions()}
              <Image alt={name} src={src()} styles={{
                image: {
                  objectFit: 'contain',
                  maxWidth: '90vw',
                  maxHeight: '90vh'
                }
              }}/>
            </>
          ) : isType('audio', mimetype) ? (
            <Stack>
              <AudioPlayer title={name} src={src()}/>
              {actions(true, false)}
            </Stack>
          ) : isType('video', mimetype) ? (
            <VideoPlayer style={{maxHeight: '90vh', maxWidth: '90vw'}} src={src()} onReport={dHandler.open}
              onInfo={handler.open} fileName={properties['File name']} canDownload={!isExploding}/>
          ) : isType('text', mimetype) ? (
            <Stack>
              <div style={{display: 'flex'}}>
                <Select size='xs' searchable value={lang} onChange={setLang} style={{flex: 1}} variant='default'
                  allowDeselect={false} creatable={false}
                  clearable={false} mr={4}
                  data={Object.entries(highlightLanguages).map(([label, lang]) => ({label, value: lang[0]}))}/>
                <Group spacing={4}>
                  <Tooltip label='Toggle word wrap'>
                    <ActionIcon variant='filled' color={wrap ? 'void' : 'gray'} onClick={() => setWrap(w => !w)}>
                      <VscWordWrap/>
                    </ActionIcon>
                  </Tooltip>
                  {actions(false, false)}
                </Group>
              </div>
              <Prism withLineNumbers styles={
                {
                  lineNumber: {
                    textAlign: 'left'
                  },
                  scrollArea: {
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '90vw',
                    maxHeight: '80vh'
                  },
                  ...(wrap && {
                    lineContent: {
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
  const {request} = useRequest();
  const validate = () =>
    request({
      endpoint: '/api/validate',
      method: 'POST',
      body: {
        id,
        password
      },
      callback({destination}) {
        showSuccess('Redirecting...', <RiNavigationFill/>);
        router.push(destination);
      },
      onError: e => showError(e, <RiErrorWarningFill/>)
    });
  return (
    <>
      <Head>
        <title>Protected URL</title>
      </Head>
      <Container style={{padding: 64}}>
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

export const getServerSideProps: GetServerSideProps = withIronSessionSsr<any>(async ({req, query}) => {
  const file = await prisma.file.findUnique({
    where: {
      slug: query.id.toString()
    },
    include: {
      user: {
        include: {
          embed: true
        }
      }
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
    if (!url.password) {
      await prisma.url.update({
        where: {
          id: url.id
        },
        data: {
          clicks: {
            increment: 1
          }
        }
      });
      return {
        redirect: {
          destination: url.destination
        },
        props: {}
      };
    }
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
  const {enabled, title, siteName, siteNameUrl, color, description, author, authorUrl} = file.user.embed || {
    enabled: false,
    siteNameUrl: '',
    color: '',
    authorUrl: ''
  };
  const replace = (text: string) =>
    text ? text.replace(/{{filename}}/ig, file.fileName)
      .replace(/{{id}}/ig, file.id)
      .replace(/{{date}}/ig, file.uploadedAt.toLocaleDateString())
      .replace(/{{time}}/ig, file.uploadedAt.toLocaleTimeString())
      .replace(/{{datetime}}/ig, file.uploadedAt.toLocaleString())
      .replace(/{{mimetype}}/ig, file.mimetype)
      .replace(/{{size}}/ig, prettyBytes(Number(file.size)))
      .replace(/{{username}}/ig, file.user.username) : null;
  if (file.isPrivate) {
    if (!req.session.user)
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
          'Size': prettyBytes(Number(file.size)),
          'Uploaded at': format(file.uploadedAt, 'longDate'),
          'Views': file.views,
          'Uploaded by': file.user.name || file.user.username || 'Unknown'
        },
        embed: {
          enabled: enabled,
          siteName: replace(siteName),
          siteNameUrl: siteNameUrl,
          title: replace(title),
          color: color,
          description: replace(description),
          author: replace(author),
          authorUrl: authorUrl,
          slug: query.id.toString()
        }
      }
    }
  };
}, ironOptions);
