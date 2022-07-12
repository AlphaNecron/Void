import {Menu, MenuProps} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';

export default function StyledMenu(props: MenuProps) {
  const { colorValue } = useThemeValue();
  return (
    <Menu {...props} styles={{
      body: {
        border: `2px solid ${colorValue('dark', 0, 4)}`
      }
    }}/>
  );
}
