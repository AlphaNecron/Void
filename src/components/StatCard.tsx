import React from 'react';
import { Stat, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';

export default function StatCard({name, value}) {
  const bg = useColorModeValue('purple.500', 'purple.200');
  const fg = useColorModeValue('white', 'gray.800');
  return (
    <Stat bg={bg} p={2} borderRadius={4} color={fg} shadow='xl'>
      <StatLabel>{name}</StatLabel>
      <StatNumber>{value}</StatNumber>
    </Stat>
  );
}