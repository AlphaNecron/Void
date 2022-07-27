import {ColorScheme, MantineThemeOverride} from '@mantine/core';

export const createTheme = (colorScheme: ColorScheme): MantineThemeOverride => (
  {
    colorScheme,
    loader: 'bars',
    primaryColor: 'void',
    fontFamily: 'Source Sans Pro, sans-serif',
    fontFamilyMonospace: 'JetBrains Mono, Source Code Pro, monospace',
    headings: {
      fontFamily: 'Source Sans Pro, sans-serif'
    },
    components: {
      Menu: {
        styles: {
          label: {
            fontWeight: 600
          },
          item: {
            maxHeight: 32,
            fontWeight: 600
          }
        }
      },
      Card: {
        defaultProps: {withBorder: true}
      },
      Paper: {
        defaultProps: {withBorder: true}
      },
      SegmentedControl: {
        styles: {
          label: {
            fontWeight: 700
          }
        }
      },
      Modal: {
        defaultProps: { overlayBlur: 4 },
        styles: theme => ({
          title: {
            fontWeight: 700,
            fontSize: theme.fontSizes.lg
          }
        })
      },
      Tooltip: {
        styles: theme => ({
          root: {
            border: `1px solid ${theme.colors.dark[theme.colorScheme === 'dark' ? 4 : 0]}`
          }
        })
      }
    },
    fontSizes: {
      xs: 13,
      sm: 14,
      md: 15,
      lg: 17,
      xl: 20
    },
    colors: {
      'void': [
        '#DDD1EE',
        '#CAB9E6',
        '#B49CDC',
        '#A287D3',
        '#9473CC',
        '#8562C5',
        '#7B54C4',
        '#663EB8',
        '#5D35B4',
        '#4828A5'
      ],
    }
  }
);
