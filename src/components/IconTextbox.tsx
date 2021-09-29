import { Icon, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import React from 'react';

export default function IconTextbox({ icon, ...other }) {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents='none' width='4.5rem'>
        <Icon as={icon} mr={8} mb={2}/>
      </InputLeftElement>
      <Input size='sm' {...other}/>
    </InputGroup>
  );
}