import React, { useEffect, useState } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td, Switch, IconButton, Button, Skeleton, Text, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverFooter, ButtonGroup, useDisclosure, useToast, FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import useFetch from 'lib/hooks/useFetch';
import router from 'next/router';
import * as yup from 'yup';
import { X, Plus, User, Trash2 } from 'react-feather';
import { Formik, Form, Field } from 'formik';
import IconTextbox from 'components/IconTextbox';
import PasswordBox from 'components/PasswordBox';
import { useStoreSelector } from 'lib/redux/store';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const { username } = useStoreSelector(s => s.user);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const schema = yup.object({
    username: yup
      .string()
      .min(3, 'Username is too short')
      .max(24, 'Username')
      .required('Username is required'),
    password: yup
      .string()
      .required('Password is required'),
    isAdmin: yup
      .boolean()
  });
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
    const res = await useFetch('/api/users', 'POST', data);
    if (res.error) {
      showToast('error', res.error);
    } else {
      showToast('success', `Created user ${res.username}`);
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
            initialValues={{ username: '', password: '', isAdmin: false }}
            validationSchema={schema}
            onSubmit={(values, actions) => { handleSubmit(values, actions); }}
          >
            {props => (
              <Form>
                <PopoverBody>
                  <Field name='username'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.username && form.touched.username} isRequired mb={4}>
                        <FormLabel htmlFor='username'>Username</FormLabel>
                        <IconTextbox icon={User} {...field} id='username' placeholder='Username' />
                        <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name='password'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.password && form.touched.password} isRequired>
                        <FormLabel htmlFor='password'>Password</FormLabel>
                        <PasswordBox {...field} id='password' mb={4} placeholder='Password' />
                      </FormControl>
                    )}
                  </Field>
                  <Field name='isAdmin'>
                    {({ field }) => (
                      <FormControl isRequired>
                        <FormLabel htmlFor='isAdmin'>Administrator</FormLabel>
                        <Switch {...field} />
                      </FormControl>
                    )}
                  </Field>
                </PopoverBody>
                <PopoverFooter
                  border='0'
                  d='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  pb={4}
                >
                  <ButtonGroup alignSelf='flex-end' size='sm'>
                    <Button onClick={onClose} leftIcon={<X size={16}/>}>Cancel</Button>
                    <Button colorScheme='purple' isLoading={props.isSubmitting} loadingText='Creating' type='submit' leftIcon={<Plus size={16} />}>Create</Button>
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
                {usr.username === username || (
                  <IconButton aria-label='Delete' size='sm' colorScheme='red' icon={<Trash2 size={16} />} />
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Skeleton>
  );
}