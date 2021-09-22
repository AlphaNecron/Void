import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export default function Navigation({children}) {
  return (
    <Box h='48px' bg={useColorModeValue('gray.100', 'gray.900')} sx={{ zIndex: 100, position: 'sticky' }} top={0} right={0} left={0} p={1} boxShadow='base'>
      {children}
    </Box>
  );
}