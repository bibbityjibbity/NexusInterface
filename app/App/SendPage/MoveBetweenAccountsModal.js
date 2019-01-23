// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

// Internal
import Text from 'components/Text';
import Select from 'components/Select';
import Button from 'components/Button';
import Modal from 'components/Modal';
import UIController from 'components/UIController';
import { rpcErrorHandler } from 'utils/form';
import { getAccountOptions } from './selectors';
import AmountField from './AmountField';

const AccountSelectors = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateRows: 'auto auto',
  gridGap: '1em .5em',
  alignItems: 'center',
});

const Label = styled.label({
  paddingRight: '2em',
});

const Buttons = styled.div({
  marginTop: '1em',
  display: 'flex',
  justifyContent: 'flex-end',
});

@connect(
  ({
    settings: { minConfirmations, fiatCurrency },
    overview: { paytxfee },
    addressbook: { myAccounts },
  }) => ({
    accountOptions: getAccountOptions(myAccounts),
    minConfirmations,
    fiatCurrency,
    paytxfee,
  })
)
@reduxForm({
  form: 'moveBetweenAccounts',
  destroyOnUnmount: false,
  initialValues: {
    moveFrom: null,
    moveTo: null,
    amount: '',
    fiatAmount: '',
  },
  validate: ({ moveFrom, moveTo, amount }) => {
    const errors = {};
    if (!moveFrom) {
      errors.moveFrom = 'No accounts selected';
    }
    if (!moveTo) {
      errors.moveTo = 'No accounts selected';
    } else if (moveTo === moveFrom) {
      errors.moveTo = 'Cannot move to the same account';
    }
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = <Text id="Alert.InvalidAmount" />;
    }
    return errors;
  },
  asyncBlurFields: ['sendTo'],
  asyncValidate: async ({ sendTo }) => {
    if (sendTo) {
      try {
        const result = await RPC.PROMISE('validateaddress', [sendTo]);
        if (!result.isvalid) {
          throw { sendTo: <Text id="Alert.InvalidAddress" /> };
        }
        if (result.ismine) {
          throw { sendTo: <Text id="Alert.registeredToThis" /> };
        }
      } catch (err) {
        throw { sendTo: <Text id="Alert.InvalidAddress" /> };
      }
    }
    return null;
  },
  onSubmit: ({ moveFrom, moveTo, amount }, dispatch, props) => {
    const params = [moveFrom, moveTo, parseFloat(amount)];
    return RPC.PROMISE('move', params, parseInt(props.minConfirmations));
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.closeModal();
    props.reset();
    props.loadMyAccounts();
    UIController.openSuccessDialog({
      message: 'NXS moved successfully',
    });
  },
  onSubmitFail: rpcErrorHandler('Error Moving NXS'),
})
class MoveBetweenAccountsForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit}>
        <AccountSelectors>
          <Label>
            <Text id="sendReceive.FromAccount" />
          </Label>
          <Field
            component={Select.RF}
            name="moveFrom"
            options={this.props.accountOptions}
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
          />

          <Label>
            <Text id="sendReceive.ToAccount" />
          </Label>
          <Field
            component={Select.RF}
            name="moveTo"
            options={this.props.accountOptions}
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
          />
        </AccountSelectors>

        <div>
          <AmountField change={this.props.change} />
          {this.props.paytxfee && (
            <div style={{ marginTop: '1em' }}>
              <Text id="sendReceive.FEE" />: {this.props.paytxfee.toFixed(5)}{' '}
              NXS
            </div>
          )}
        </div>

        <Buttons>
          <Button skin="primary" type="submit" disabled={this.props.submitting}>
            <Text id="sendReceive.MoveNXS" />
          </Button>
        </Buttons>
      </form>
    );
  }
}

const MoveBetweenAccountsModal = () => (
  <Modal style={{ maxWidth: 650 }}>
    {closeModal => (
      <>
        <Modal.Header>
          <Text id="sendReceive.MoveNxsBetweenAccount" />
        </Modal.Header>

        <Modal.Body>
          <MoveBetweenAccountsForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default MoveBetweenAccountsModal;
