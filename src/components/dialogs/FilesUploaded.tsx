import {ActionIcon, Group, ScrollArea, Text} from '@mantine/core';
import {ContextModalProps} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import StyledTooltip from 'components/StyledTooltip';
import useThemeValue from 'lib/hooks/useThemeValue';
import React from 'react';
import {FiClipboard, FiExternalLink, FiTrash} from 'react-icons/fi';
import {RiClipboardFill} from 'react-icons/ri';

export default function Dialog_FilesUploaded({innerProps: {files, onCopy}}: ContextModalProps<{ files: { name: string, url: string, deletionUrl: string }[], onCopy: (text: string) => void }>) {
  const {value, colorValue} = useThemeValue();
  const LabelledAction = ({label, ...props}) => (
    <StyledTooltip label={label}>
      <ActionIcon {...props}/>
    </StyledTooltip>
  );
  return (
    <ScrollArea scrollbarSize={4} style={{border: `2px solid ${colorValue('dark', 0, 6)}`, height: 200}}>
      {files.map((f, i) => (
        <Group position='apart' py={6} px='sm' sx={theme => ({
          background: value('white', theme.colors.dark[7]), cursor: 'default', '&:hover': {
            background: colorValue('dark', 0, 6)
          }
        })}
        key={i}>
          <StyledTooltip label={f.name}>
            <Text weight={700} style={{
              maxWidth: 250,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'}}>
              {f.name}
            </Text>
          </StyledTooltip>
          <Group spacing={4}>
            <LabelledAction color='blue' label='Open in new tab' component='a' href={f.url} target='_blank'>
              <FiExternalLink/>
            </LabelledAction>
            <LabelledAction color='red' label='Delete' component='a' href={f.deletionUrl} target='_blank'>
              <FiTrash/>
            </LabelledAction>
            <LabelledAction color='green' label='Copy to clipboard' onClick={() => {
              onCopy(f.url);
              showNotification({ title: 'Copied the URL to your clipboard.', message: '', color: 'green', icon: <RiClipboardFill/>});
            }}>
              <FiClipboard/>
            </LabelledAction>
          </Group>
        </Group>
      ))}
    </ScrollArea>
  );
}
