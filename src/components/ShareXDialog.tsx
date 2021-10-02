import { Button, ButtonGroup, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Switch } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Download, X } from 'react-feather';

export default function ShareXDialog({ open, onClose, token }) {
  const ref = React.useRef();
  const [name, setName] = useState('Void');
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
        Authorization: token,
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
        Authorization: token
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
            placeholder='Void'
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
          <ButtonGroup size='sm'>
            <Button onClick={onClose} leftIcon={<X size={16}/>}>Cancel</Button>
            <Button colorScheme='purple' leftIcon={<Download size={16}/>} onClick={() => generateConfig(true)}>Shortener</Button>
            <Button colorScheme='purple' leftIcon={<Download size={16}/>} onClick={() => generateConfig(false)} ref={ref}>Uploader</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}