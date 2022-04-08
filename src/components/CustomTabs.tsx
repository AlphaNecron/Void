import React from 'react';
import {Tabs, TabsProps} from '@mantine/core';

export default function CustomTabs({ children, ...props }: TabsProps) {
  return (
    <Tabs
      variant='unstyled'
      styles={(theme) => ({
        tabControl: {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9],
          border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[4]}`,
          fontSize: theme.fontSizes.md,
          padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
          '&:not(:first-of-type)': {
            borderLeft: 0,
          },
          '&:first-of-type': {
            borderTopLeftRadius: theme.radius.md,
            borderBottomLeftRadius: theme.radius.md,
          },
          '&:last-of-type': {
            borderTopRightRadius: theme.radius.md,
            borderBottomRightRadius: theme.radius.md,
          },
        },
        tabLabel: {
          fontWeight: 'bold',
          fontSize: theme.fontSizes.md
        },
        tabActive: {
          backgroundColor: theme.colors[theme.primaryColor][7],
          borderColor: theme.colors[theme.primaryColor][7],
          color: theme.white,
        },
      })}
      {...props}
    >
      {children}
    </Tabs>
  );
}
