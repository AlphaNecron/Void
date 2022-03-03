import { Box, Button, Center, FormControl, FormErrorMessage, FormLabel, Heading, Text, useColorModeValue, useToast, VStack } from '@chakra-ui/react';
import IconTextbox from 'components/IconTextbox';
import PasswordBox from 'components/PasswordBox';
import { Field, Form, Formik } from 'formik';
import useFetch from 'lib/hooks/useFetch';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { LogIn, User } from 'react-feather';
import * as yup from 'yup';

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const schema = yup.object({
    username: yup
      .string()
      .required('Username is required'),
    password: yup
      .string()
      .required('Password is required')
  });
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
  return (
    <Center h='100vh'>
      <Box
        borderRadius={6}
        p={4}
        w={300}
        bg={useColorModeValue('gray.100', 'gray.700')}
        boxShadow={useColorModeValue('outline', 'dark-lg')}>
        <Formik initialValues={{ username: '', password: '' }} validationSchema={schema}
          onSubmit={(values, actions) => onSubmit(actions, values)}
        >
          {props => (
            <Form>
              <VStack>
                <Heading fontSize='xl' mb={2} textAlign='center'>Void</Heading>
                <Field name='username'>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.username && form.touched.username} isRequired mb={4}>
                      <FormLabel htmlFor='username'>Username</FormLabel>
                      <IconTextbox icon={User} {...field} id='username' placeholder='Username'/>
                      <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name='password'>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.password && form.touched.password} isRequired>
                      <FormLabel htmlFor='password'>Password</FormLabel>
                      <PasswordBox {...field} id='password' mb={4} placeholder='Password'/>
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
                  <LogIn size={16}/>
                  <Text ml={2}>Login</Text>
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Center>
  );
}

Login.title = 'Login';
