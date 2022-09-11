import {Box, PasswordInput, Popover, Progress, Text} from '@mantine/core';
import {useState} from 'react';
import {BiCheck, BiX} from 'react-icons/bi';

function PasswordRequirement({meets, label}: { meets: boolean; label: string }) {
  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{display: 'flex', alignItems: 'center'}}
      mt={7}
      size='sm'
    >
      {meets ? <BiCheck /> : <BiX />} <Box ml={10}>{label}</Box>
    </Text>
  );
}

const requirements = [
  {re: /\d/, label: 'Includes number'},
  {re: /[a-z]/, label: 'Includes lowercase letter'},
  {re: /[A-Z]/, label: 'Includes uppercase letter'},
  {re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol'}
];

function getStrength(password: string) {
  return Math.max(100 - (100 / (requirements.length + 1)) * ((password.length > 5 ? 0 : 1) + requirements.filter(req => !req.re.test(password)).length), 10);
}

export default function PasswordBox({value = '', ...props}) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));

  const strength = getStrength(value);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  return (
    <Popover
      opened={popoverOpened}
      position='bottom-start'
      withArrow
      withinPortal
      trapFocus={false}
      transition='pop-top-left'
    >
      <Popover.Target>
        <PasswordInput
          onFocusCapture={() => setPopoverOpened(true)}
          onBlurCapture={() => setPopoverOpened(false)}
          {...props}
          value={value}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <Progress color={color} value={strength} size={5} style={{marginBottom: 10}} />
        <PasswordRequirement label='Includes at least 6 characters' meets={value.length > 5} />
        {checks}
      </Popover.Dropdown>
    </Popover>
  );
}
