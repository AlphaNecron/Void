import React from 'react';
import { Box } from '@chakra-ui/react';

export default function Navigation({children}) {
  return (
    <Box h='48px' sx={{ zIndex: 100, position: 'sticky' }} top={0} right={0} left={0} p={1} boxShadow='base'>
      {children}
    </Box>
  );
}