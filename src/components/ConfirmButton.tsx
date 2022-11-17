import { Button, ButtonProps } from '@mantine/core';
import { useState } from 'react';

export default function ConfirmButton({onClick, children, ...props}: ButtonProps & { onClick: (e) => void }) {
  const [pending, setPending] = useState(false);
  return (
    <Button onClick={e => {
      if (!pending) {
        setPending(true);
        setTimeout(() =>
          setPending(false), 25e2);
      } else {
        setPending(false);
        onClick(e);
      }
    }} {...props}>
      {pending ? 'Click here again to confirm' : children}
    </Button>
  );
}
