import { Text, Tooltip } from '@mantine/core';
import List from 'components/List';

export default function Dialog_FileDelete({files}: { files: string[] }) {
  return (
    <List items={files}>
      {f => (
        <Tooltip label={f}>
          <Text weight={700} style={{
            maxWidth: 350,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {f}
          </Text>
        </Tooltip>
      )}
    </List>
  );
}
