import React, { useState } from 'react';
import { Select, Button, Modal, ModalOverlay, ModalContent, ModalHeader, Switch, ModalCloseButton, ModalBody, ModalFooter, Heading, Input } from '@chakra-ui/react';
import { X, Download } from 'react-feather';

export default function ShareXDialog({ open, onClose, token }) {
  const ref = React.useRef();
  const [name, setName] = useState('Draconic');
  const [generator, setGenerator] = useState('random');
  const [preserveFileName, setPreserveFileName] = useState(false);
  const generateConfig = () => {
    const config = {
      Version: '13.2.1',
      Name: name,
      DestinationType: 'ImageUploader, FileUploader, TextUploader',
      RequestMethod: 'POST',
      RequestURL: `${window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')}/api/upload`,
      Headers: {
        Token: token,
        Generator: generator,
        ...(preserveFileName && { PreserveFileName: 'true' })
      },
      URL: '$json:url$',
      ThumbnailURL: '$json:thumbUrl$',
      DeletionURL: '$json:deletionUrl$',
      ErrorMessage: '$json:error$',
      Body: 'MultipartFormData',
      FileFormName: 'file'
    };
    const a = document.createElement('a');
    a.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, '\t')));
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
          <Button size='sm' colorScheme='purple' leftIcon={<Download size={16}/>} onClick={generateConfig} ref={ref}>Download</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}