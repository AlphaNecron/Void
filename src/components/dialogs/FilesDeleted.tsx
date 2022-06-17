import {ScrollArea, Text} from '@mantine/core';
import {ContextModalProps} from '@mantine/modals';
import useThemeValue from 'lib/hooks/useThemeValue';
import React from 'react';

export default function Dialog_FilesDeleted({innerProps}: ContextModalProps<{ files: { fileName: string }[] }>) {
  const {value, colorValue} = useThemeValue();
  return (
    <ScrollArea scrollbarSize={4} style={{ border: `2px solid ${colorValue('dark', 0, 6)}`, height: 200}}>
      {innerProps.files.map((f, i) => (
        <Text py={6} px='sm' weight={700} sx={theme => ({background: value('white', theme.colors.dark[7]), cursor: 'default', '&:hover': {
          background: colorValue('dark', 0, 6)
        }})}
        key={i}>{f.fileName}</Text>
      ))}
    </ScrollArea>
  );
}
