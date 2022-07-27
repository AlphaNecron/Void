import {Code, ScrollArea, ScrollAreaProps, useMantineTheme} from '@mantine/core';

type ConsoleProps = {
    lines:
      {
        timestamp: string,
        level: 'info' | 'warn' | 'error' | 'debug',
        message: string
      }[]
  } & ScrollAreaProps

export default function Console({lines, ...props}: ConsoleProps) {
  const {colors} = useMantineTheme();
  const levelColors = {
    info: 'blue',
    success: 'green',
    warn: 'yellow',
    error: 'red'
  };
  const colorize = (level: string) => colors[levelColors[level]][6] ?? 'magenta';
  return (
    <ScrollArea scrollbarSize={4} offsetScrollbars {...props}>
      <Code block style={{ lineHeight: 0.5, fontSize: 13, fontWeight: 700 }}>
        {lines.map((line, i) => (
          <p key={i}>
            <span style={{color: colors.gray[7]}}>
                [{line.timestamp}] ›
            </span>
            <span style={{color: colorize(line.level)}}> {line.level} </span>
            <span>{line.message}</span>
          </p>
        ))}
      </Code>
    </ScrollArea>
  );
}
