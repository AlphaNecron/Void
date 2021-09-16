import React, { useRef, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormErrorMessage, FormLabel, ButtonGroup, useToast, Icon } from '@chakra-ui/react';
import PasswordBox from './PasswordBox';
import { Field, Form, Formik } from 'formik';
import { updateUser } from 'lib/redux/reducers/user';
import useFetch from 'lib/hooks/useFetch';
import { useStoreDispatch } from 'lib/redux/store';
import { useRouter } from 'next/router';
import copy from 'copy-to-clipboard';
import { X, Check, RefreshCw, Clipboard, User, Key, Hexagon, Feather } from 'react-feather';
import IconTextbox from './IconTextbox';

export default function ManageAccountDialog({ onClose, open, user }) {
  const ref = useRef();
  const [token, setToken] = useState(user.token);
  const dispatch = useStoreDispatch();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const validateUsername = username => {
    if (username.trim() === '') {
      return 'Username is required';
    }
  };
  const regenToken = async () => {
    setBusy(true);
    const res = await useFetch('/api/user/token', 'PATCH');
    if (res.success) setToken(res.token);
    setBusy(false);
  };
  const handleSubmit = async (values, actions) => {
    const data = {
      username: values.username.trim(),
      ...(values.password.trim() === '' || { password: values.password.trim() } as {}),
      embedColor: values.embedColor.trim(),
      embedTitle: values.embedTitle
    };
    const res = await useFetch('/api/user', 'PATCH', data);
    if (res.error) {
      toast({
        title: 'Couldn&#39;t update user info',
        description: res.error,
        duration: 4000,
        status: 'error',
        isClosable: true
      });
    } else {
      dispatch(updateUser(res));
      router.reload();
    }
    setBusy(false);
    actions.setSubmitting(false);
    onClose();
  };
  return (
    <Modal
      onClose={onClose}
      initialFocusRef={ref}
      isOpen={open}
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <Formik
        initialValues={{ username: user.username, password: '', embedTitle: user.embedTitle, embedColor: user.embedColor }}
        onSubmit={(values, actions) => { handleSubmit(values, actions); }}
      >
        {(props) => (
          <Form>
            <ModalContent>
              <ModalHeader>Manage your account</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Field name='username' validate={validateUsername}>
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.username}>
                      <FormLabel htmlFor='username'>Username</FormLabel>
                      <IconTextbox icon={User} {...field} isInvalid={form.errors.username} id='username' placeholder='Username' />
                      <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name='password'>
                  {({ field }) => (
                    <FormControl>
                      <FormLabel mt={2} htmlFor='password'>Password</FormLabel>
                      <PasswordBox {...field} id='password' placeholder='Blank = unchanged' />
                    </FormControl>
                  )}
                </Field>
                <Field name='embedTitle'>
                  {({ field }) => (
                    <FormControl>
                      <FormLabel mt={2} htmlFor='embedTitle'>Embed title</FormLabel>
                      <IconTextbox icon={Feather} {...field} id='embedTitle' placeholder='Embed title' />
                    </FormControl>
                  )}
                </Field>
                <Field name='embedColor'>
                  {({ field }) => (
                    <FormControl>
                      <FormLabel mt={2} htmlFor='embedColor'>Embed color</FormLabel>
                      <IconTextbox icon={Hexagon} {...field} type='color' id='embedColor' placeholder='Embed color' />
                    </FormControl>
                  )}
                </Field>
                <FormLabel mt={2}>Token</FormLabel>
                <IconTextbox icon={Key} isReadOnly placeholder='Token' value={token} />
                <ButtonGroup size='sm' mt={2}>
                  <Button size='sm' leftIcon={<Icon as={Clipboard}/>} onClick={() => copy(token)} colorScheme='yellow'>Copy token</Button>
                  <Button size='sm' leftIcon={<Icon as={RefreshCw}/>} colorScheme='red' isLoading={busy} loadingText='Regenerating token' onClick={regenToken}>Regenerate token</Button>
                </ButtonGroup>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup size='sm'>
                  <Button leftIcon={<Icon as={X}/>} onClick={onClose}>Cancel</Button>
                  <Button leftIcon={<Icon as={Check}/>} isLoading={props.isSubmitting} loadingText='Saving' type='submit' colorScheme='purple' ref={ref}>Save</Button>
                </ButtonGroup>
              </ModalFooter>
            </ModalContent>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}