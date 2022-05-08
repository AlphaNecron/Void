import {Group, Text, ThemeIcon, Tooltip, UnstyledButton} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';
import React from 'react';
import {RiShieldStarFill} from 'react-icons/ri';

export default function NavigationItem({ id, currentPageId, requiresAdmin = false, width = '100%', onClick, label, color, icon, ...props }) {
  const { value } = useThemeValue();
  return (
    <UnstyledButton
      onClick={onClick}
      {...props}
      sx={(theme) => ({
        display: 'block',
        width,
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: value(theme.black, theme.colors.dark[0]),
        background: currentPageId === id && value(theme.colors.dark[1], theme.colors.dark[5]),
        '&:hover': {
          backgroundColor: value(theme.colors.dark[0], theme.colors.dark[6]),
        },
      })}
    >
      <Group position='apart'>
        <Group>
          <ThemeIcon variant='light' color={color}>
            {icon}
          </ThemeIcon>
          <Text size='md' weight={600}>{label}</Text>
        </Group>
        {requiresAdmin &&
          <Tooltip label='Administration'>
            <RiShieldStarFill/>
          </Tooltip>}
      </Group>
    </UnstyledButton>
  );
}
