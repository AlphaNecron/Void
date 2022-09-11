import {ActionIcon, Card, CardProps, CopyButton, Group, MantineColor, Title, Tooltip} from '@mantine/core';
import {ReactNode} from 'react';
import {FiCheck} from 'react-icons/fi';

type Action = {
  label: string;
  icon: ReactNode;
  action?: () => void; color: MantineColor;
  busy?: boolean;
  value?: string;
  disabled?: boolean;
}

export default function ItemCard({
  children,
  title,
  actions,
  ...props
}: { title?: string, actions: Action[] } & CardProps) {
  return (
    <Card shadow='xl' {...props}>
      <Card.Section>
        {children}
      </Card.Section>
      <Group mb={-12} mr={-8} ml={-4} mt={6} spacing='xs' position='apart'>
        <Title style={{
          maxWidth: `calc(100% - ${32 * actions.length}px)`,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }} order={6}>{title}</Title>
        <Group spacing={0}>
          {actions.filter(action => !action.disabled).map(action =>
            action.value ? (
              <CopyButton value={action.value} key={action.label}>
                {({copied, copy}) => (
                  <Tooltip color={copied && 'green'} label={copied ? 'Copied to your clipboard' : action.label}>
                    <ActionIcon variant={copied ? 'filled' : 'subtle'} onClick={copy}>
                      {copied ? <FiCheck/> : action.icon}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            ) : (
              <Tooltip key={action.label} label={action.label}>
                <ActionIcon loading={action.busy} color={action.color} onClick={action.action}>
                  {action.icon}
                </ActionIcon>
              </Tooltip>
            ))}
        </Group>
      </Group>
    </Card>
  );
}
