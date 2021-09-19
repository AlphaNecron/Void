import React, { useEffect } from 'react';
import { FormControl, Button, Input, FormLabel, Text, FormErrorMessage, Box, Flex, Checkbox, Heading, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import { LogIn, User } from 'react-feather';
import { useRouter } from 'next/router';
import useFetch from 'lib/hooks/useFetch';
import PasswordBox from 'components/PasswordBox';
import IconTextbox from 'components/IconTextbox';

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const validateUsername = username => {
    let error;
    if (username.trim() === '') {
      error = 'Username is required';
    }
    return error;
  };

  useEffect(() => {
    (async () => {
      const a = await fetch('/api/user');
      if (a.ok) router.push('/dash');
    })();
  }, []);

  const onSubmit = async (actions, values) => {
    const username = values.username.trim();
    const password = values.password.trim();
    const res = await useFetch('/api/auth/login', 'POST', {
      username, password
    });
    if (res.error) {
      showToast('error', res.error);
    } else {
      showToast('success', 'Logged in');
      router.push('/dash');
    }
    actions.setSubmitting(false);
  };

  const showToast = (srv, content) => {
    toast({
      title: content,
      status: srv,
      duration: 5000,
      isClosable: true,
    });
  };

  const validatePassword = password => {
    let error;
    if (password.trim() === '') {
      error = 'Password is required';
    }
    return error;
  };
  const bg = useColorModeValue('gray.100', 'gray.700');
  const shadow = useColorModeValue('outline', 'dark-lg');
  return (
    <Flex minHeight='100vh' width='full' align='center' justifyContent='center'>
      <Box
        p={4}
        bg={bg}
        width={250}
        justify='flex-end'
        align='center'
        borderRadius={6}
        boxShadow={shadow}
      >
        <Formik initialValues={{ username: '', password: '' }}
          onSubmit={(values, actions) => onSubmit(actions, values)}
        >
          {(props) => (
            <Form>
              <VStack>
                <Heading fontSize='xl' mb={2} align='center'>Draconic</Heading>
                <Field name='username' validate={validateUsername}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.username && form.touched.username} isRequired mb={4}>
                      <FormLabel htmlFor='username'>Username</FormLabel>
                      <IconTextbox icon={User} {...field} id='username' placeholder='Username' />
                      <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name='password' validate={validatePassword}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.password && form.touched.password} isRequired>
                      <FormLabel htmlFor='password'>Password</FormLabel>
                      <PasswordBox {...field} id='password' mb={4} placeholder='Password' />
                    </FormControl>
                  )}
                </Field>
                <Button
                  colorScheme='purple'
                  isLoading={props.isSubmitting}
                  loadingText='Logging in'
                  type='submit'
                  width='full'
                >
                  <LogIn size={16} />
                  <Text ml={2}>Login</Text>
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Flex>
  );
}