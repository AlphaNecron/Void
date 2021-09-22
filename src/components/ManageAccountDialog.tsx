import { Button, ButtonGroup, FormControl, FormErrorMessage, FormLabel, Icon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import { Field, Form, Formik } from 'formik';
import useFetch from 'lib/hooks/useFetch';
import { updateUser } from 'lib/redux/reducers/user';
import { useStoreDispatch } from 'lib/redux/store';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { Check, Clipboard, Feather, Hexagon, Key, RefreshCw, User, X } from 'react-feather';
import * as yup from 'yup';
import IconTextbox from './IconTextbox';
import PasswordBox from './PasswordBox';

export default function ManageAccountDialog({ onClose, open, user }) {
  const ref = useRef();
  const schema = yup.object({
    username: yup
      .string()
      .min(3, 'Username is too short')
      .max(24, 'Username is too long')
      .required('Username is required')
  });
  const [token, setToken] = useState(user.token);
  const dispatch = useStoreDispatch();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
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
        title: 'Couldn\'t update user info',
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
      <Formik validationSchema={schema}
        initialValues={{ username: user.username, password: '', embedTitle: user.embedTitle, embedColor: user.embedColor }}
        onSubmit={(values, actions) => { handleSubmit(values, actions); }}
      >
        {(props) => (
          <Form>
            <ModalContent>
              <ModalHeader>Manage your account</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Field name='username'>
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
                  <Button leftIcon={<X size={16}/>} onClick={onClose}>Cancel</Button>
                  <Button leftIcon={<Check size={16}/>} isLoading={props.isSubmitting} loadingText='Saving' type='submit' colorScheme='purple' ref={ref}>Save</Button>
                </ButtonGroup>
              </ModalFooter>
            </ModalContent>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}