import {ActionIcon, Button} from '@mantine/core';
import {Tooltip} from '@mantine/core';

export default function ResponsiveButton({ icon, label, condition, ...props}){
  return (
    condition ?
      <Button {...props} leftIcon={icon}>{label}</Button>
      : <Tooltip label={label}>
        <ActionIcon variant='filled' {...props}>
          {icon}
        </ActionIcon>
      </Tooltip>
  );
}
