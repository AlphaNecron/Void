import { Button, Center, Title } from '@mantine/core';
import React, { Component } from 'react';
import Container from 'components/Container';
import { IoIosArrowBack } from 'react-icons/io';
import { noop } from 'lib/constants';

export default class ErrorBoundary extends Component<any, {
  error?: Error;
}> {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }


  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  render() {
    return this.state.error ? (
      <Center style={{height: '100vh', width: '100vw'}}>
        <Container style={{textAlign: 'center'}} py={64} px={128}>
          <Title>
            {this.state.error.message || 'Unknown error occurred'}
          </Title>
          <Button mt={32} onClick={this.props.back || noop} leftIcon={<IoIosArrowBack />}>
            Back to Dashboard
          </Button>
        </Container>
      </Center>
    ) : this.props.children;
  }
}
