import {
  ActionIcon,
  Group,
  LoadingOverlay,
  MantineNumberSize,
  Menu,
  Paper,
  SegmentedControl,
  Slider,
  Stack,
  Transition
} from '@mantine/core';
import {useBooleanToggle} from '@mantine/hooks';
import StyledTooltip from 'components/StyledTooltip';
import VolumeIndicator from 'components/VolumeIndicator';
import {Duration} from 'luxon';
import React, {useRef, useState} from 'react';
import {FiDownload, FiFastForward, FiFlag, FiInfo, FiPause, FiPlay, FiRewind} from 'react-icons/fi';
import {TbPin, TbPinnedOff} from 'react-icons/tb';

export default function VideoPlayer({src, canDownload, fileName, onInfo, onReport, ...props}) {
  const ref = useRef<HTMLVideoElement>();
  const [playing, togglePlaying] = useBooleanToggle(false);
  const [dura, setDura] = useState(0);
  const [time, setTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [vol, setVol] = useState(0.5);
  const [show, setShow] = useState(false);
  const ticker = useRef<NodeJS.Timeout>();
  const [pin, setPin] = useState(false);
  const [rate, setRate] = useState(ref.current?.defaultPlaybackRate || 1);
  const rates = [0.5, 1, 1.25, 1.5, 2];
  const onDurationChanged = ({currentTarget: {duration, readyState}}) => {
    if (readyState > 0)
      setDura(duration);
  };
  const toggle = () => ref.current[playing ? 'pause' : 'play']();
  const s2m = (secs: number) => Duration.fromObject({seconds: secs}).toFormat('hh:mm:ss');
  const seek = (range: number) => {
    ref.current.fastSeek ? ref.current.fastSeek(ref.current.currentTime + range) : ref.current.currentTime += range;
  };
  const Action = ({icon, label, size = 'lg', ...props}) => (
    <StyledTooltip label={label}>
      <ActionIcon variant='transparent' size={size as MantineNumberSize} {...props}>
        {icon}
      </ActionIcon>
    </StyledTooltip>
  );
  return (
    <Paper m='-md' mb={-22} style={{position: 'relative'}} {...props}>
      <video onRateChange={({currentTarget: {playbackRate}}) => setRate(playbackRate)} onMouseMove={() => {
        setShow(true);
        if (ticker.current) {
          window.clearTimeout(ticker.current);
        }
        ticker.current = setTimeout(() => {
          setShow(false);
        }, 3e3);
      }} onLoadedData={onDurationChanged} onVolumeChange={({currentTarget: {volume}}) => setVol(volume)}
      onTimeUpdate={({currentTarget: {currentTime}}) => setTime(currentTime)} onWaiting={() => setBusy(true)}
      onPlaying={() => setBusy(false)} onDurationChange={onDurationChanged}
      style={{position: 'relative'}} onClick={toggle} src={src} ref={ref} {...props}
      onPause={() => togglePlaying(false)} onPlay={e => {
        togglePlaying(true);
        onDurationChanged(e);
      }}/>
      <LoadingOverlay zIndex={100} visible={busy}/>
      <Transition transition='slide-up' duration={200} exitDuration={200} mounted={show || pin}>
        {styles => (
          <Stack spacing={0} style={styles} py={4} px='xs' m={0}
            sx={theme => ({
              background: theme.fn.rgba(theme.colors.dark[9], 0.5),
              backdropFilter: 'blur(10px)',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 103
            })}>
            <Slider size='sm' style={{width: '98%', alignSelf: 'center'}} value={time} min={0} max={dura}
              onChange={t => {
                ref.current.currentTime = t;
                setTime(t);
              }} mb={4} label={`${s2m(time)} / ${s2m(dura)}`}/>
            <Group mt={-4} spacing={4} mx='md' position='apart' align='center'>
              <Group spacing={4}>
                <Action icon={<FiRewind/>} label='Seek backward' onClick={() => seek(-10)}/>
                <Action onClick={toggle} icon={playing ? <FiPause/> : <FiPlay/>} label={playing ? 'Pause' : 'Play'}/>
                <Action icon={<FiFastForward/>} label='Seek forward' onClick={() => seek(10)}/>
              </Group>
              <Group mr='xs' align='center' spacing={4}>
                <VolumeIndicator level={vol * 100}/>
                <Slider size='xs' value={vol} onChange={v => {
                  ref.current.volume = v;
                  setVol(v);
                }} label={v => (v * 100).toFixed(0)} min={0} step={0.01} max={1} style={{width: 80}}/>
                <Action icon={pin ? <TbPinnedOff/> : <TbPin/>} label={pin ? 'Unpin' : 'Pin'} onClick={() => setPin(p => !p)}/>
                <Menu position='top'>
                  <Menu.Label>Playback rate</Menu.Label>
                  <SegmentedControl mb={4} value={rate.toString()} fullWidth onChange={v => {
                    const r = Number(v);
                    ref.current.playbackRate = r;
                    setRate(r);
                  }} size='xs' data={rates.map(r => ({label: <strong>x{r}</strong>, value: r.toString()}))}/>
                  <Menu.Item onClick={onInfo} icon={<FiInfo size={14}/>}>Info</Menu.Item>
                  {canDownload && <Menu.Item icon={<FiDownload size={14}/>} component='a' href={src}
                    download={fileName}>Download</Menu.Item>}
                  <Menu.Item color='red' onClick={onReport} icon={<FiFlag size={14}/>}>Report</Menu.Item>
                </Menu>
              </Group>
            </Group>
          </Stack>
        )}
      </Transition>
    </Paper>
  );
}
