import {Center, Paper, Text, useMantineTheme} from '@mantine/core';
import StyledTooltip from 'components/StyledTooltip';
import useThemeValue from 'lib/hooks/useThemeValue';
import React, {useState} from 'react';
import {QRCode} from 'react-qrcode-logo';

export default function HiddenQR({ value, size = 96 }: { value: string, size?: number }) {
  const [show, setShow] = useState(false);
  const { colors, primaryColor } = useMantineTheme();
  const { value: themeValue, colorValue } = useThemeValue();
  return (
    show ? (
      <StyledTooltip position='right' withArrow label={
        <Center style={{ height: '100%' }}>
          <QRCode bgColor={colorValue('dark', 0, 6, 0.5)} fgColor={colorValue('dark', 9, 0)} value={value} size={192}/>
        </Center>
      }>
        <div style={{
          height: size + 6 * 2,
          width: size + 6 * 2,
          borderRadius: 4,
          overflow: 'hidden'
        }} onClick={() => setShow(false)}>
          <QRCode bgColor={themeValue('white', colors.dark[6])} fgColor={themeValue('black', colors[primaryColor][0])} quietZone={4} size={size} qrStyle='dots' ecLevel='M' value={value}/>
        </div>
      </StyledTooltip>
    ) : <Paper style={{height: size + 6 * 2, width: size + 6 * 2}} onClick={() => setShow(true)}>
      <Center style={{height: '100%'}}>
        <Text style={{userSelect: 'none'}} weight={700}>Reveal QR</Text>
      </Center>
    </Paper>
  );
}
