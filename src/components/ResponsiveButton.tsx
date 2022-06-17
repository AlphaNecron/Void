import {ActionIcon, Button} from '@mantine/core';
import StyledTooltip from 'components/StyledTooltip';
import React from 'react';

export default function ResponsiveButton({ icon, label, condition, ...props}){
  return (
    condition ?
      <Button {...props} leftIcon={icon}>{label}</Button>
      : <StyledTooltip label={label}>
        <ActionIcon variant='filled' {...props}>
          {icon}
        </ActionIcon>
      </StyledTooltip>
  );
}
