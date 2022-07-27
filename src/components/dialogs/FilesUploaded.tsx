import {ActionIcon, Group, Text, Tooltip} from '@mantine/core';
import {ContextModalProps} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import List from 'components/List';
import {FiClipboard, FiExternalLink, FiTrash} from 'react-icons/fi';
import {RiClipboardFill} from 'react-icons/ri';

export default function Dialog_FilesUploaded({innerProps: {files, onCopy}}: ContextModalProps<{ files: { name: string, url: string, deletionUrl: string }[], onCopy: (text: string) => void }>) {
  const LabelledAction = ({label, ...props}) => (
    <Tooltip label={label}>
      <ActionIcon {...props}/>
    </Tooltip>
  );
  return (
    <List items={files}>
      {f => (
        <>
          <Tooltip label={f.name}>
            <Text weight={700} style={{
              maxWidth: 250,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'}}>
              {f.name}
            </Text>
          </Tooltip>
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
        </>
      )}
    </List>
  );
}
