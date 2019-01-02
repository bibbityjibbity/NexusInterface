// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { color } from 'utils';

const ConfirmModalComponent = styled(Modal)({
  width: 500,
});

const QuestionMark = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 56,
  color: theme.light,
  width: 80,
  height: 80,
  borderRadius: '50%',
  borderWidth: 2,
  borderStyle: 'solid',
  filter: `drop-shadow(0 0 5px ${color.fade(theme.light, 0.5)})`,
  margin: '0 auto 20px',
}));

const Question = styled.div({
  textAlign: 'center',
  fontSize: 28,
});

const Note = styled.div({
  textAlign: 'center',
  marginTop: '.5em',
});

const Buttons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 50,
  fontSize: 18,
});

const ConfirmModalButton = styled(Button)({
  minWidth: 180,
});

const ConfirmModal = ({
  question,
  note,
  yesLabel,
  yesCallback,
  noLabel,
  noCallback,
  ...rest
}) => (
  <ConfirmModalComponent {...rest}>
    {closeModal => (
      <Modal.Body>
        <QuestionMark>?</QuestionMark>
        <Question>{question}</Question>
        {!!note && <Note>{note}</Note>}
        <Buttons>
          <ConfirmModalButton
            onClick={() => {
              noCallback && noCallback();
              closeModal();
            }}
          >
            {noLabel || 'No'}
          </ConfirmModalButton>
          <ConfirmModalButton
            skin="primary"
            onClick={() => {
              yesCallback && yesCallback();
              closeModal();
            }}
          >
            {yesLabel || 'Yes'}
          </ConfirmModalButton>
        </Buttons>
      </Modal.Body>
    )}
  </ConfirmModalComponent>
);

export default ConfirmModal;