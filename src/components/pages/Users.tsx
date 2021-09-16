import React, { useEffect, useState } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td, Button, Skeleton, Text, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverFooter, ButtonGroup, useDisclosure, useToast } from '@chakra-ui/react';
import useFetch from 'lib/hooks/useFetch';
import router from 'next/router';
import { Plus } from 'react-feather';
import { Formik, Form } from 'formik';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const updateUsers = async () => {
    setBusy(true);
    const res = await useFetch('/api/users');
    if (!res.error) {
      setUsers(res);
    } else {
      router.push('/dash');
    };
    setBusy(false);
  };
  const validateField = (value, name) => {
    if (value.trim() === '') {
      return `${name} is required`;
    }
  };
  const showToast = (srv, title) => {
    toast({
      title,
      status: srv,
      duration: 3000,
      isClosable: true
    });
  };
  const handleSubmit = async (values, actions) => {
    const data = {
      username: values.username.trim(),
      password: values.password.trim(),
      isAdmin: values.isAdmin
    };
    setBusy(true);
    const res = await useFetch('/api/auth/create', 'POST', data);
    if (res.error) {
      showToast('error', res.error);
    } else {
      showToast('success', 'Created the user');
    }
    actions.setSubmitting(false);
  };
  useEffect(() => { updateUsers(); }, []);
  return (
    <Skeleton m={2} isLoaded={!busy}>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement='right-start'
      >
        <PopoverTrigger>
          <Button colorScheme='purple' leftIcon={<Plus size={20} />}>New user</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader fontWeight='bold' border='0'>
            Create a new user
          </PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <Formik
            initialValues={{ username: '', password: '' }}
            onSubmit={(values, actions) => { handleSubmit(values, actions); }}
          >
            {(props) => (
              <Form>
                <PopoverBody>


                </PopoverBody>
                <PopoverFooter
                  border='0'
                  d='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  pb={4}
                >
                  <ButtonGroup alignSelf='flex-end' size='sm'>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button colorScheme='purple' leftIcon={<Plus size={16} />}>Create</Button>
                  </ButtonGroup>
                </PopoverFooter>
              </Form>
            )}
          </Formik>
        </PopoverContent>
      </Popover>
      <Table>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Username</Th>
            <Th>Role</Th>
            <Th>Embed color</Th>
            <Th>Embed title</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((usr, i) => (
            <Tr key={i}>
              <Td>{usr.id}</Td>
              <Td>{usr.username}</Td>
              <Td>{usr.isAdmin ? 'Administrator' : 'User'}</Td>
              <Td>
                <Text sx={{ color: usr.embedColor }}>{usr.embedColor}</Text>
              </Td>
              <Td>{usr.embedTitle}</Td>
              <Td>
                <Button size='sm' colorScheme='red'>Delete</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Skeleton >
  );
}