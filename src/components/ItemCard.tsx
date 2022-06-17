import {ActionIcon, Card, CardProps, Group, MantineColor, Title} from '@mantine/core';
import StyledTooltip from 'components/StyledTooltip';
import useThemeValue from 'lib/hooks/useThemeValue';
import React from 'react';

export default function ItemCard({ children, title, actions, ...props } : { title?: string, actions: { label: string, icon: JSX.Element, action: () => void, color: MantineColor, busy?: boolean }[] } & CardProps<null>) {
  const { value } = useThemeValue();
  return (
    <Card shadow='xl' sx={theme => ({ border: `solid 2px ${value(theme.fn.lighten(theme.colors.dark[1], 0.5), theme.colors.dark[5])}` })} {...props}>
      <Card.Section>
        {children}
      </Card.Section>
      <Group mb={-12} mr={-8} ml={-4} mt={6} position='apart'>
        <Title style={{ maxWidth: `${100-10*actions.length}%`, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} order={6}>{title}</Title>
        <Group spacing={0}>
          {actions.map(action => (
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
