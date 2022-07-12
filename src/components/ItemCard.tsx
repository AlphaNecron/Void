import {ActionIcon, Card, CardProps, Group, MantineColor, Title} from '@mantine/core';
import StyledTooltip from 'components/StyledTooltip';
import useThemeValue from 'lib/hooks/useThemeValue';
import {ReactNode} from 'react';

export default function ItemCard({ children, title, actions, ...props } : { title?: string, actions: { label: string, icon: ReactNode, action: () => void, color: MantineColor, busy?: boolean, disabled?: boolean }[] } & CardProps<null>) {
  const { value } = useThemeValue();
  return (
    <Card shadow='xl' sx={theme => ({ border: `solid 2px ${value(theme.fn.lighten(theme.colors.dark[1], 0.5), theme.colors.dark[5])}` })} {...props}>
      <Card.Section>
        {children}
      </Card.Section>
      <Group mb={-12} mr={-8} ml={-4} mt={6} spacing='xs' position='apart'>
        <Title style={{ maxWidth: `calc(100% - ${32*actions.length}px)`, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} order={6}>{title}</Title>
        <Group spacing={0}>
          {actions.filter(action => !action.disabled).map(action => (
            <StyledTooltip key={action.label} label={action.label}>
              <ActionIcon loading={action.busy} color={action.color} onClick={action.action}>
                {action.icon}
              </ActionIcon>
            </StyledTooltip>
          ))}
        </Group>
      </Group>
    </Card>
  );
}
