import { Button, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Switch } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Download, X } from 'react-feather';

export default function ShareXDialog({ open, onClose, token }) {
  const ref = React.useRef();
  const [name, setName] = useState('Draconic');
  const [generator, setGenerator] = useState('random');
  const [preserveFileName, setPreserveFileName] = useState(false);
  const generateConfig = shortener => {
    const apiUrl = `${window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')}/api`;
    const uploaderConfig = {
      Version: '13.2.1',
      Name: name,
      DestinationType: 'ImageUploader, FileUploader, TextUploader',
      RequestMethod: 'POST',
      RequestURL: `${apiUrl}/upload`,
      Headers: {
        Token: token,
        Generator: generator,
        PreserveFileName: preserveFileName ? 'true' : ''
      },
      URL: '$json:url$',
      ThumbnailURL: '$json:thumbUrl$',
      DeletionURL: '$json:deletionUrl$',
      ErrorMessage: '$json:error$',
      Body: 'MultipartFormData',
      FileFormName: 'file'
    };
    const shortenerConfig = {
      Version: '13.2.1',
      Name: name,
      DestinationType: 'URLShortener, URLSharingService',
      RequestMethod: 'POST',
      RequestURL: `${apiUrl}/shorten`,
      Headers: {
        Token: token
      },
      Body: 'FormURLEncoded',
      Arguments: {
        destination: '$input$'
      },
      URL: '$json:url$',
      ErrorMessage: '$json:error$'
    };
    const a = document.createElement('a');
    a.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(shortener ? shortenerConfig : uploaderConfig, null, '\t')));
    a.setAttribute('download', `${name.replaceAll(' ', '_')}.sxcu`);
    a.click();
  };
  return (
    <Modal
      onClose={onClose}
      initialFocusRef={ref}
      isOpen={open}
      scrollBehavior='inside'
    >
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>ShareX config generator</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <Heading mb={1} size='sm'>Config name</Heading>
          <Input
            value={name}
            onChange={n => setName(n.target.value)}
            placeholder='Draconic'
            size='sm'
          />
          <Heading mt={2} mb={1} size='sm'>URL generator</Heading>
          <Select
            value={generator}
            onChange={g => setGenerator(g.target.value)}
            size='sm'
          >
            <option value='random'>Random</option>
            <option value='zws'>Invisible</option>
            <option value='emoji'>Emoji</option>
          </Select>
          <Heading mt={2} mb={1} size='sm'>Preserve file name</Heading>
          <Switch isChecked={preserveFileName} onChange={p => setPreserveFileName(p.target.checked)}/>
        </ModalBody>
        <ModalFooter>
          <Button size='sm' onClick={onClose} leftIcon={<X size={16}/>} mx={2}>Cancel</Button>
          <Button size='sm' colorScheme='purple' leftIcon={<Download size={16}/>} onClick={() => generateConfig(true)} ref={ref}>Shortener</Button>
          <Button size='sm' colorScheme='purple' leftIcon={<Download size={16}/>} onClick={() => generateConfig(false)} ref={ref}>Uploader</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}