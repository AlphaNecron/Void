import { Code, ScrollArea, ScrollAreaProps, useMantineTheme } from '@mantine/core';
import { LogEntry } from 'lib/types';

type ConsoleProps = {
  entries: LogEntry[]
} & ScrollAreaProps

export default function Console({entries, ...props}: ConsoleProps) {
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
      <Code block style={{lineHeight: 0.5, fontSize: 13, fontWeight: 700}}>
        {entries.map((entry, i) => (
          <p key={i}>
            <span style={{color: colors.gray[7]}}>
              <>
                [{entry.timestamp}] {entry.prefix} ›
              </>
            </span>
            <span style={{color: colorize(entry.level)}}> {entry.level} </span>
            <span>{entry.message}</span>
          </p>
        ))}
      </Code>
    </ScrollArea>
  );
}
