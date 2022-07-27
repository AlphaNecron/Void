import {Group, Text, ThemeIcon, Tooltip, UnstyledButton} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';
import {RiShieldStarFill} from 'react-icons/ri';

export default function NavigationItem({ highlight, requiresAdmin = false, width = '100%', label, color, icon, ...props }) {
  const { value } = useThemeValue();
  return (
    <UnstyledButton
      {...props}
      sx={(theme) => ({
        display: 'block',
        width,
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: value(theme.black, theme.colors.dark[0]),
        background: highlight && value(theme.colors.dark[1], theme.colors.dark[5]),
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
        {requiresAdmin && (
          <Tooltip label='Administration'>
            <RiShieldStarFill/>
          </Tooltip>
        )}
      </Group>
    </UnstyledButton>
  );
}
