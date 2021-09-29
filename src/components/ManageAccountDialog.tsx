import { Button, ButtonGroup, Checkbox, FormControl, FormErrorMessage, FormLabel, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Tooltip, useColorModeValue, useToast } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import { Field, Form, Formik } from 'formik';
import useFetch from 'lib/hooks/useFetch';
import { updateUser } from 'lib/redux/reducers/user';
import { useStoreDispatch } from 'lib/redux/store';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import { Check, Copy, Feather, Hash, Info, Key, RefreshCw, Send, Tag, User, X } from 'react-feather';
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
  const [useEmbed, setUseEmbed] = useState(user.useEmbed);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const regenToken = async () => {
    setBusy(true);
    const res = await useFetch('/api/user/token', 'PATCH');
    if (res.success) setToken(res.token);
    setBusy(false);
  };
  const handleSubmit = async (values, actions) => {
    const gdata = {
      username: values.username.trim(),
      password: values.password.trim()
    };
    const edata = {
      useEmbed,
      embedSiteName: values.embedSiteName,
      embedColor: values.embedColor.trim(),
      embedTitle: values.embedTitle,
      embedDesc: values.embedDesc
    };
    const res = await useFetch('/api/user', 'PATCH', tab === 0 ? gdata : edata);
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
      <ModalOverlay/>
      <Formik validationSchema={schema}
        initialValues={{ username: user.username, password: '', embedSiteName: user.embedSiteName, embedTitle: user.embedTitle, embedColor: user.embedColor, embedDesc: user.embedDesc }}
        onSubmit={(values, actions) => { handleSubmit(values, actions); }}
      >
        {(props) => (
          <Form>
            <ModalContent>
              <ModalHeader>Manage your account</ModalHeader>
              <ModalCloseButton/>
              <ModalBody>
                <Tabs size='sm' index={tab} onChange={setTab}>
                  <TabList>
                    <Tab>General</Tab>
                    <Tab>Embed</Tab>
                    {tab === 1 && (
                      <Tooltip label={(
                        <>
                          <h6>Variables</h6>
                          <p>{'{size}: file size'}</p>
                          <p>{'{filename}: file name'}</p>
                          <p>{'{orig}: original file name'}</p>
                          <p>{'{date}: date uploaded'}</p>
                          <p>{'{time}: time uploaded'}</p>
                          <p>{'{author}: uploader\'s username'}</p>
                        </>
                      )} bg={useColorModeValue('purple.500', 'purple.200')} isOpen={tooltipOpen}>
                        <IconButton onClick={() => setTooltipOpen(!tooltipOpen)} aria-label='Info' size='xs' icon={<Info size={14}/>} ml={2} colorScheme='purple' alignSelf='center'/>
                      </Tooltip>
                    )}
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Field name='username'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.username}>
                            <FormLabel htmlFor='username'>Username</FormLabel>
                            <IconTextbox icon={User} {...field} isInvalid={form.errors.username} id='username' placeholder='Username'/>
                            <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name='password'>
                        {({ field }) => (
                          <FormControl>
                            <FormLabel mt={2} htmlFor='password'>Password</FormLabel>
                            <PasswordBox {...field} id='password' placeholder='Blank = unchanged'/>
                          </FormControl>
                        )}
                      </Field>
                      <FormLabel mt={2}>Token</FormLabel>
                      <IconTextbox icon={Key} isReadOnly placeholder='Token' value={token}/>
                      <ButtonGroup size='sm' mt={2}>
                        <Button size='sm' leftIcon={<Copy size={16}/>} onClick={() => copy(token)} colorScheme='yellow'>Copy</Button>
                        <Button size='sm' leftIcon={<RefreshCw size={16}/>} colorScheme='red' isLoading={busy} loadingText='Regenerating' onClick={regenToken}>Regenerate</Button>
                      </ButtonGroup>
                    </TabPanel>
                    <TabPanel>
                      <FormLabel mt={2} htmlFor='useEmbed'>Use embed</FormLabel>
                      <Checkbox isChecked={useEmbed} onChange={u => setUseEmbed(u.target.checked)} id='useEmbed'>
                        Use embed
                      </Checkbox>
                      <Field name='embedSiteName'>
                        {({ field }) => (
                          <FormControl>
                            <FormLabel mt={2} htmlFor='embedSiteName'>Site name</FormLabel>
                            <IconTextbox icon={Send} {...field} id='embedSiteName' placeholder='Site name'/>
                          </FormControl>
                        )}
                      </Field>
                      <Field name='embedTitle'>
                        {({ field }) => (
                          <FormControl>
                            <FormLabel mt={2} htmlFor='embedTitle'>Embed title</FormLabel>
                            <IconTextbox icon={Feather} {...field} id='embedTitle' placeholder='Embed title'/>
                          </FormControl>
                        )}
                      </Field>
                      <Field name='embedColor'>
                        {({ field }) => (
                          <FormControl>
                            <FormLabel mt={2} htmlFor='embedColor'>Embed color</FormLabel>
                            <IconTextbox icon={Hash} {...field} type='color' id='embedColor' placeholder='Embed color'/>
                          </FormControl>
                        )}
                      </Field>
                      <Field name='embedDesc'>
                        {({ field }) => (
                          <FormControl>
                            <FormLabel mt={2} htmlFor='embedDesc'>Embed description</FormLabel>
                            <IconTextbox icon={Tag} {...field} id='embedDesc' placeholder='Embed description'/>
                          </FormControl>
                        )}
                      </Field>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
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