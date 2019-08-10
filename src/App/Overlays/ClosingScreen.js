import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

import FullScreen from './FullScreen';

const breathe = keyframes`
  0% {
    opacity: 1
  }
  100% {
    opacity: .5
  }
`;

const Wrapper = styled.div({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ClosingMessage = styled.div(({ theme }) => ({
  color: theme.primary,
  fontSize: 24,
  animation: `${breathe} 2s ease 0s infinite alternate`,
}));

const ClosingScreen = () => (
  <FullScreen width={null}>
    <Wrapper>
      <ClosingMessage>{__('Closing Nexus Wallet')}</ClosingMessage>
    </Wrapper>
  </FullScreen>
);

export default ClosingScreen;
