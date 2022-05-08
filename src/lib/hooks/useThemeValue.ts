import {useMantineTheme} from '@mantine/core';

export default function useThemeValue() {
  const theme = useMantineTheme();
  return {
    isDark: theme.colorScheme === 'dark',
    value: <T>(valueIfLight: T, valueIfDark: T) => theme.colorScheme === 'dark' ? valueIfDark : valueIfLight
  };
}

