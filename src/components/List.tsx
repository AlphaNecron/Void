import { Table, TableCaption, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
export default function List({ types, users }) {
  return (
    <>
      <Table variant='simple' size='sm'>
        <TableCaption placement='top'>
          <Text align='left' fontSize='xl'>By type</Text>
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Index</Th>
            <Th>File type</Th>
            <Th>Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {types.map((type, i) => (
            <Tr key={i}>
              <Td>{i}</Td>
              <Td>{type.mimetype}</Td>
              <Td>{type.count}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Table variant='simple' size='sm'>
        <TableCaption placement='top'>
          <Text align='left' fontSize='xl'>By user</Text>
        </TableCaption>
        <Thead>
          <Tr>
            <Th>Index</Th>
            <Th>Username</Th>
            <Th>File count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((usr, i) => (
            <Tr key={i}>
              <Td>{i}</Td>
              <Td>{usr.username}</Td>
              <Td>{usr.count}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}