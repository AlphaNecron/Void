import {ActionIcon, Anchor, Group, Text} from '@mantine/core';
import {useBooleanToggle} from '@mantine/hooks';
import {FiEye, FiEyeOff} from 'react-icons/fi';

export default function Spoil({url, children, ...props}) {
  const [reveal, toggle] = useBooleanToggle(false);
  const l = children.length;
  const inner = url ? <Anchor target='_blank' href={children} {...props}>{children}</Anchor> : <Text {...props}>{children}</Text>;
  return (
    <Group spacing={4} style={{ display: 'inline-flex'}}>
      {reveal ? inner : '*'.repeat(Math.min(16, l))}
      <ActionIcon size='xs' onClick={() => toggle()}>{reveal ? <FiEyeOff/> : <FiEye/>}</ActionIcon>
    </Group>
  );
}
