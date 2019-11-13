import React from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import SelectField from 'components/Select';
import confirm from 'utils/promisified/confirm';
import confirmPin from 'utils/promisified/confirmPin';
import { apiPost } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { loadAccounts } from 'lib/user';
import { removeModal, showNotification } from 'lib/ui';
import { namedAccount } from 'lib/fees';
import GA from 'lib/googleAnalytics';

const mapStateToProps = state => {
  return {
    userTokens: state.core.tokens,
  };
};
@connect(
  mapStateToProps,
  null,
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    initialValues: {
      name: '',
      token: ownProps.tokenName,
    },
  })
)
@reduxForm({
  form: 'new_account',
  destroyOnUnmount: true,
  validate: ({ name, token }) => {
    const errors = {};
    console.log(token);
    return errors;
  },
  onSubmit: async ({ name }, dispatch, props) => {
    if (!name) {
      const confirmed = await confirm({
        question: __('Create a account without a name?'),
        note: __('Adding a name costs a NXS fee'),
        labelYes: __("That's Ok"),
        labelNo: __('Cancel'),
      });

      if (!confirmed) {
        throw { name: __('Add Name') };
      }
    }
    const pin = await confirmPin();
    if (pin) {
      const params = { pin };
      if (name) params.name = name;

      if (props.tokenName === 'NSX') {
        return await apiPost('finance/create/account', params);
      } else {
        if (props.tokenName) params.token_name = props.tokenName;
        if (props.tokenAddress) params.token = props.tokenAddress;
        return await apiPost('tokens/create/account', params);
      }
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    GA.SendEvent('Users', 'NewAccount', 'Accounts', 1);
    loadAccounts();
    removeModal(props.modalId);
    showNotification(
      __('New account %{account} has been created', {
        account: props.values.name,
      }),
      'success'
    );
  },
  onSubmitFail: errorHandler(__('Error creating account')),
})
export default class NewAccountModal extends React.Component {
  returnTokenSelect = event => {
    let values = [];
    values.push({ value: { Name: 'NXS', address: '0' }, display: 'NXS' });
    values.forEach(e => {
      values.push({ value: e.name || e.address, display: e.name || e.address });
    });
    return values;
  };

  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
        style={{ maxWidth: 400 }}
      >
        <Modal.Header>{__('New account')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField
              connectLabel
              label={__('Account name (%{nameFee} NXS Fee) (Optional)', {
                nameFee: namedAccount,
              })}
            >
              <Field
                name="name"
                component={TextField.RF}
                placeholder={__("New account's name")}
              />
            </FormField>

            <FormField connectLabel label={'asdasdasd'}>
              <Field
                name="token"
                component={SelectField.RF}
                placeholder={__('token')}
                options={this.returnTokenSelect()}
              />
            </FormField>

            <div className="mt3 flex space-between">
              <Button
                onClick={() => {
                  this.closeModal();
                }}
              >
                {__('Cancel')}
              </Button>
              <Button skin="primary" type="submit" disabled={submitting}>
                {submitting
                  ? __('Creating account') + '...'
                  : __('Create account')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
