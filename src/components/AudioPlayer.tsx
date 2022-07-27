import {ActionIcon, Center, Group, Slider, Stack, Title, Tooltip} from '@mantine/core';
import VolumeIndicator from 'components/VolumeIndicator';
import prettyMilliseconds from 'pretty-ms';
import {useRef, useState} from 'react';
import {FiFastForward, FiPause, FiPlay, FiRewind} from 'react-icons/fi';
import {RiMusicFill} from 'react-icons/ri';

export default function AudioPlayer({src, title, ...props}) {
  const ref = useRef<HTMLAudioElement>();
  const [playing, setPlaying] = useState(false);
  const [dura, setDura] = useState(0);
  const [time, setTime] = useState(0);
  const [vol, setVol] = useState(0.5);
  const seek = (range: number) => { ref.current.fastSeek ? ref.current.fastSeek(ref.current.currentTime + range) : ref.current.currentTime += range; };
  const s2m = (secs: number) => prettyMilliseconds(secs * 1e3, { colonNotation: true, secondsDecimalDigits: 0 });
  const onStateChanged = ({target}) => { setPlaying(!target.paused); setDura(target.duration); };
  const Action = ({ icon, label, ...props }) => (
    <Tooltip label={label}>
      <ActionIcon variant='subtle' size='lg' {...props}>
        {icon}
      </ActionIcon>
    </Tooltip>
  );
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
        <Action icon={<FiRewind/>} label='Backward 10 seconds'
          onClick={() => seek(-10)}/>
        <Action label={playing ? 'Pause' : 'Play'} icon={playing ? <FiPause/> : <FiPlay/>} onClick={() =>
          ref.current[playing ? 'pause' : 'play']()}/>
        <Action label='Forward 10 seconds' icon={<FiFastForward/>}
          onClick={() => seek(10)}/>
      </Group>
      <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
        <Slider size='sm' style={{
          flex: 1
        }} mr='sm' value={time} min={0} max={dura} onChange={t => {
          ref.current.currentTime = t;
          if (!playing)
            ref.current.play();
        }} label={`${s2m(time)} / ${s2m(dura)}`}/>
        <VolumeIndicator level={vol * 100}/>
        <Slider size='sm' style={{ width: 64 }} color='yellow' ml={4} value={vol} label={Math.round(vol * 100)}
          onChange={v => ref.current.volume = v}
          min={0} max={1} step={0.01}/>
        <audio style={{ display: 'none' }} ref={ref} src={src} onVolumeChange={({currentTarget: { volume }}) => setVol(volume)}
          onPause={onStateChanged} onPlay={onStateChanged}
          onTimeUpdate={({ currentTarget: { currentTime }}) => { setTime(currentTime); }} onCanPlayThrough={({currentTarget: { duration }}) =>
            setDura(duration)
          } onEnded={() => setPlaying(false)}/>
      </div>
    </Stack>
  )
  ;
}
