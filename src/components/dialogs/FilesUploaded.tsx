import { ActionIcon, CopyButton, Group, Text, Tooltip } from '@mantine/core';
import List from 'components/List';
import { FiCheck, FiClipboard, FiExternalLink, FiTrash } from 'react-icons/fi';

export default function Dialog_FilesUploaded({files}: { files: { name: string, url: string, deletionUrl: string }[] }) {
  const LabelledAction = ({label, tooltipColor = '', ...props}) => (
    <Tooltip label={label} color={tooltipColor}>
      <ActionIcon {...props} />
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
              whiteSpace: 'nowrap'
            }}>
              {f.name}
            </Text>
          </Tooltip>
          <Group spacing={4}>
            <LabelledAction color='blue' label='Open in new tab' component='a' href={f.url} target='_blank'>
              <FiExternalLink />
            </LabelledAction>
            <LabelledAction color='red' label='Delete' component='a' href={f.deletionUrl} target='_blank'>
              <FiTrash />
            </LabelledAction>
            <CopyButton value={f.url}>
              {({copied, copy}) => (
                <LabelledAction color='green' tooltipColor={copied && 'green'}
                  label={copied ? 'Copy to clipboard' : 'Copied to your clipboard'}
                  onClick={() => copy()}>
                  {copied ? <FiCheck /> : <FiClipboard />}
                </LabelledAction>
              )}
            </CopyButton>
          </Group>
        </>
      )}
    </List>
  );
}
