import {Container, ScrollArea, Text} from '@mantine/core';
import {ContextModalProps} from '@mantine/modals';
import StyledTooltip from 'components/StyledTooltip';
import useThemeValue from 'lib/hooks/useThemeValue';
import React from 'react';

export default function Dialog_FilesDeleted({innerProps: { files }}: ContextModalProps<{ files: { fileName: string }[] }>) {
  const {value, colorValue} = useThemeValue();
  return (
    <ScrollArea scrollbarSize={4} style={{ border: `2px solid ${colorValue('dark', 0, 6)}`, height: 200}}>
      {files.map((f, i) => (
        <Container py={6} px='sm' sx={theme => ({background: value('white', theme.colors.dark[7]), cursor: 'default', '&:hover': {
          background: colorValue('dark', 0, 6)
        }})}
        key={i}>
          <StyledTooltip label={f.fileName}>
            <Text weight={700} style={{
              maxWidth: 350,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'}}>
              {f.fileName}
            </Text>
          </StyledTooltip>
        </Container>
      ))}
    </ScrollArea>
  );
}
