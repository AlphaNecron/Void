import {ActionIcon, Center, Group, Slider, Stack, Title} from '@mantine/core';
import {useBooleanToggle} from '@mantine/hooks';
import StyledTooltip from 'components/StyledTooltip';
import {Duration} from 'luxon';
import React, {useRef, useState} from 'react';
import {AiFillFastBackward, AiFillFastForward} from 'react-icons/ai';
import {FiVolume, FiVolume1, FiVolume2, FiVolumeX} from 'react-icons/fi';
import {RiMusicFill, RiPauseFill, RiPlayFill} from 'react-icons/ri';

function Volume({level = 0}) {
  return level >= 75 ? <FiVolume2/> : level >= 35 ? <FiVolume1/> : level > 0 ? <FiVolume/> : <FiVolumeX/>;
}

function Action({icon, label, ...props}) {
  return (
    <StyledTooltip label={label}>
      <ActionIcon variant='hover' size='lg' {...props}>
        {icon}
      </ActionIcon>
    </StyledTooltip>
  );
}

export default function AudioPlayer({src, title, ...props}) {
  const ref = useRef<HTMLAudioElement>();
  const [playing, setPlaying] = useBooleanToggle(false);
  const [dura, setDura] = useState(0);
  const [time, setTime] = useState(0);
  const [vol, setVol] = useState(0.5);
  const seek = (range: number) => { ref.current.fastSeek ? ref.current.fastSeek(ref.current.currentTime + range) : ref.current.currentTime += range; };
  const s2m = (secs: number) => Duration.fromObject({seconds: secs}).toFormat('hh:mm:ss');
  const onStateChanged = ({target}) => { setPlaying(!target.paused); setDura(target.duration); };
  return (
    <Stack spacing='lg' style={{alignItems: 'center'}} {...props}>
      <Center mx={64} my={32}
        sx={theme => ({
          borderRadius: '100%',
          width: 128,
          height: 128,
          background: theme.colors.dark[theme.colorScheme === 'dark' ? 6 : 0]
        })}>
        <RiMusicFill size={72}/>
      </Center>
      <Title style={{
        maxWidth: '30vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }} align='center' order={6}>{ref.current?.title || title}</Title>
      <Group spacing={4} grow my='-sm'>
        <Action icon={<AiFillFastBackward/>} label='Backward 10 seconds'
          onClick={() => seek(-10)}/>
        <Action label={playing ? 'Pause' : 'Play'} icon={playing ? <RiPauseFill/> : <RiPlayFill/>} onClick={() => {
          ref.current[playing ? 'pause' : 'play']();
          setPlaying();
        }}/>
        <Action label='Forward 10 seconds' icon={<AiFillFastForward/>}
          onClick={() => seek(10)}/>
      </Group>
      <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
        <Slider style={{
          flex: 1
        }} mr='sm' value={time} min={0} max={dura} onChange={t => {
          ref.current.currentTime = t;
          if (!playing) {
            setPlaying(true);
            ref.current.play();
          }
        }} label={`${s2m(time)}/${s2m(dura)}`}/>
        <Volume level={vol * 100}/>
        <Slider style={{ width: 64 }} color='yellow' ml={4} value={vol} label={Math.round(vol * 100)}
          onChange={v => ref.current.volume = v}
          min={0} max={1} step={0.01}/>
        <audio style={{ display: 'none' }} ref={ref} src={src} onVolumeChange={({currentTarget}) => setVol(currentTarget.volume)}
          onPause={onStateChanged} onPlay={onStateChanged}
          onTimeUpdate={() => { setTime(ref.current.currentTime); }} onCanPlayThrough={({currentTarget}) => {
            setDura(currentTarget.duration);
            currentTarget.volume = vol;
          }
          } onEnded={() => setPlaying(false)}/>
      </div>
    </Stack>
  )
  ;
}
