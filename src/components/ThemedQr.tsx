import {useMantineTheme} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';
import {IProps, QRCode} from 'react-qrcode-logo';

export default function ThemedQr({
  theme,
  ...props
}: { theme?: { light: { bg: string, fg: string }, dark: { bg: string, fg: string } } } & IProps) {
  const {value} = useThemeValue();
  const {colors, primaryColor} = useMantineTheme();
  const primary = colors[primaryColor];
  if (!theme)
    theme = {light: {fg: primary[4], bg: 'white'}, dark: {fg: primary[0], bg: colors.dark[7]}};
  return (
    <QRCode fgColor={value(theme.light.fg, theme.dark.fg)} bgColor={value(theme.light.bg, theme.dark.bg)} {...props}/>
  );
}
