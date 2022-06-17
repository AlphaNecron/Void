import {MantineColor, useMantineTheme} from '@mantine/core';

export default function useThemeValue() {
  const { colorScheme, colors, fn: { lighten: lightenColor } } = useMantineTheme();
  const isDark = colorScheme === 'dark';
  return {
    isDark,
    value: <T>(valueIfLight: T, valueIfDark: T) => isDark ? valueIfDark : valueIfLight,
    colorValue: (color: MantineColor, shadeIfLight: number, shadeIfDark: number, lighten?: number): string => isDark ? colors[color][shadeIfDark] : lightenColor(colors[color][shadeIfLight], lighten || 0)
  };
}

