import {Text, Tooltip} from '@mantine/core';
import {ContextModalProps} from '@mantine/modals';
import List from 'components/List';

export default function Dialog_FilesDeleted({innerProps: { files }}: ContextModalProps<{ files: { fileName: string }[] }>) {
  return (
    <List items={files}>
      {f => (
        <Tooltip label={f.fileName}>
          <Text weight={700} style={{
            maxWidth: 350,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'}}>
            {f.fileName}
          </Text>
        </Tooltip>
      )}
    </List>
  );
}
