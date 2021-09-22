import { Icon, IconButton, Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react';
import React from 'react';
import { Eye, EyeOff, Lock } from 'react-feather';

export default function PasswordBox(props) {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  return (
    <InputGroup size='md'>
      <InputLeftElement pointerEvents='none' width='4.5rem'>
        <Icon as={Lock} mr={8} mb={2}/>
      </InputLeftElement>
      <Input
        pr='4.5rem' size='sm'
        type={show ? 'text' : 'password'} {...props}
      />
      <InputRightElement width='4.5rem'>
        <IconButton aria-label='Reveal' colorScheme='purple' icon={<Icon as={show ? EyeOff : Eye}/>} h='1.5rem' mt={-2} mr={-8} size='sm' onClick={handleClick}/>
      </InputRightElement>
    </InputGroup>
  );
}