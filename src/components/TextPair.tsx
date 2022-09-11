import {Text} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';

export default function TextPair({label, value, ...props}) {
  const {value: themeValue} = useThemeValue();
  return (
    <Text size='sm' weight={700} color='dimmed' {...props}>
      {label}: <Text size='sm' style={{display: 'inline'}}
        color={themeValue('dark', 'white')}>{value || 'Unknown'}</Text>
    </Text>
  );
}
