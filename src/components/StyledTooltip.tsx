import {Tooltip, TooltipProps} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';

export default function StyledTooltip(props: TooltipProps) {
  const { colorValue, value } = useThemeValue();
  return (
    <Tooltip {...props} color='dark' styles={{
      body: {
        color: value('black', 'white'),
        background: colorValue('dark', 0, 6, 0.5),
        border: `1px solid ${colorValue('dark',2, 4)}`
      }
    }}/>
  );
}
