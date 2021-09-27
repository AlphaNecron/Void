import { Button, ButtonGroup, FormControl, FormLabel, HStack, IconButton, Input, Link, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Skeleton, Table, TableCaption, Tbody, Td, Th, Thead, Tr, useDisclosure, useToast } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import { Field, Form, Formik } from 'formik';
import useFetch from 'lib/hooks/useFetch';
import React, { useEffect, useState } from 'react';
import { ExternalLink, Scissors, Trash2, X } from 'react-feather';
import * as yup from 'yup';

export default function URLs() {
  const [urls, setUrls] = useState([]);
  const [filter, setFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const schema = yup.object({
    destination: yup.string().test('Valid destination', 'Invalid destination', dest => {
      try {
        new URL(dest);
      } catch (e) {
        return false;
      }
      return true;
    }).required('Destination is required'),
    vanity: yup.string()
  });
  const handleDelete = async u => {
    const res = await useFetch('/api/user/urls', 'DELETE', { id: u.id });
    if (res.id) {
      updateUrls();
      showToast('success', `Successfully deleted url ${u.short}`);
    }
    else showToast('error', `Couldn't delete url ${u.short}`, res.error);
  };
  const showToast = (srv, title, description?) => {
    toast({
      title,
      status: srv,
      isClosable: true,
      description,
      duration: 3000
    });
  };
  const updateUrls = async () => {
    setBusy(true);
    const urls = await useFetch('/api/user/urls');
    setUrls(urls);
    setBusy(false);
  };
  const handleSubmit = async (values, actions) => {
    const data = {
      destination: values.destination.trim(),
      ...(values.vanity.trim() === '' || { vanity: values.vanity } as {})
    };
    setBusy(true);
    const res = await useFetch('/api/shorten', 'POST', data);
    if (res.error) 
      showToast('error', 'Couldn\'t shorten the url', res.error);
    else
      copyUrl(res);
    setBusy(false);
    actions.setSubmitting(false);
  };
  const copyUrl = u => {
    if (copy(u.url)) showToast('info', 'Copied the URL to your clipboard');
  };
  useEffect(() => { 
    updateUrls();
  }, []);
  return (
    <>
      <Skeleton isLoaded={!busy}>
        <Table>
          <TableCaption placement='top'>
            <HStack>
              <Popover
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                placement='right-start'
              >
                <PopoverTrigger>
                  <Button size='sm' colorScheme='purple' leftIcon={<Scissors size={16}/>}>Shorten</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverHeader fontWeight='bold' border='0'>
                    Shorten a URL
                  </PopoverHeader>
                  <PopoverArrow/>
                  <PopoverCloseButton/>
                  <Formik validationSchema={schema} initialValues={{ destination: '', vanity: '' }} onSubmit={(values, actions) => { handleSubmit(values, actions); }}>
                    {props => (
                      <Form>
                        <PopoverBody>
                          <Field name='destination'>
                            {({ field, form }) => (
                              <FormControl isInvalid={form.errors.destination && form.touched.destination} isRequired>
                                <FormLabel htmlFor='destination'>Destination</FormLabel>
                                <Input {...field} size='sm' id='destination' mb={4} placeholder='Destination'/>
                              </FormControl>
                            )}
                          </Field>
                          <Field name='vanity'>
                            {({ field }) => (
                              <FormControl>
                                <FormLabel htmlFor='vanity'>Vanity URL</FormLabel>
                                <Input {...field} size='sm' id='vanity' mb={4} placeholder='Leave blank for random'/>
                              </FormControl>
                            )}
                          </Field>
                        </PopoverBody>
                        <PopoverFooter 
                          border='0'
                          d='flex'
                          justifyContent='flex-end'
                          pb={4}
                          pt={-4}
                        >
                          <ButtonGroup size='sm'>
                            <Button onClick={onClose} leftIcon={<X size={16}/>}>Cancel</Button>
                            <Button colorScheme='purple' isLoading={props.isSubmitting} loadingText='Shortening' type='submit' leftIcon={<Scissors size={16}/>}>Shorten</Button>
                          </ButtonGroup>
                        </PopoverFooter>
                      </Form>
                    )}
                  </Formik>
                </PopoverContent>
              </Popover>
              <Input size='sm' variant='filled' placeholder='Search something' value={filter} onChange={f => setFilter(f.target.value)}/>
            </HStack>
          </TableCaption>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Slug</Th>
              <Th>Destination</Th>
              <Th>Created at</Th>
              <Th>Views</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {urls.map((u, i) =>
              [u.short, u.destination].some(p => p.toLowerCase().includes(filter.toLowerCase())) && (
                <Tr key={i}>
                  <Td>{u.id}</Td>
                  <Td>{u.short}</Td>
                  <Td>{u.destination}</Td>
                  <Td>{new Date(u.createdAt).toLocaleString()}</Td>
                  <Td>{u.views}</Td>
                  <Td>
                    <ButtonGroup>
                      <Link href={u.url} isExternal>
                        <IconButton aria-label='Open in new tab' size='sm' colorScheme='purple' icon={<ExternalLink size={16}/>}/>
                      </Link>
                      <IconButton aria-label='Delete' size='sm' colorScheme='red' onClick={() => handleDelete(u)} icon={<Trash2 size={16}/>}/>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </Skeleton>
    </>
  );
}