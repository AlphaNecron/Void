import {Group, Text, ThemeIcon, UnstyledButton} from '@mantine/core';
import React from 'react';

export default function NavigationItem({ id, currentPageId, width = '100%', onClick, label, color, icon, ...props }) {
  return (
    <UnstyledButton
      onClick={onClick}
      {...props}
      sx={(theme) => ({
        display: 'block',
        width,
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        background: currentPageId === id && (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.dark[1]),
        '&:hover': {
          backgroundColor:
          theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.dark[0],
        },
      })}
    >
      <Group>
        <ThemeIcon variant='light' color={color}>
          {icon}
        </ThemeIcon>
        <Text size='md' weight={600}>{label}</Text>
      </Group>
    </UnstyledButton>
  );
}
