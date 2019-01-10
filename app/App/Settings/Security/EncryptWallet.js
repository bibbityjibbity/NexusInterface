// External
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import { consts } from 'styles';

const EncryptWalletForm = styled.form({
  flex: 2,
  marginRight: '1em',
});

const Note = styled.div(({ theme }) => ({
  padding: '1em',
  border: `2px dashed ${theme.gray}`,
  color: theme.gray,
}));

const Characters = styled.span({
  fontFamily: consts.monoFontFamily,
  letterSpacing: 4,
});

const passwordRegex = /[-$/&*|<>]/;

@reduxForm({
  form: 'encryptWallet',
  initialValues: {
    password: '',
    passwordRepeat: '',
  },
  validate: ({ password, passwordRepeat }) => {
    const errors = {};
    if (passwordRegex.test(password)) {
      errors.password =
        'Password cannot contain these characters: - $ / & * | < >';
    } else if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (password.endsWith(' ') || password.startsWith(' ')) {
      errors.password = 'Password cannot start or end with spaces';
    }
    if (passwordRepeat !== password) {
      errors.passwordRepeat = 'Passwords do not match';
    }
    return errors;
  },
  onSubmit: ({ password }) => RPC.PROMISE('encryptwallet', [newPass.value]),
  onSubmitSuccess: () => {
    UIController.openSuccessDialog({
      message: <Text id="Alert.WalletHasBeenEncrypted" />,
      onClose: () => {
        this.props.history.push('/');
        this.props.ResetForEncryptionRestart();
        remote.getGlobal('core').start();
        UIController.showNotification('Daemon is restarting...');
      },
    });
  },
  onSubmitFail: (errors, dispatch, submitError) => {
    UIController.openErrorDialog({
      message: 'Error encrypting wallet',
      note: (submitError && submitError.message) || 'An unknown error occurred',
    });
  },
})
export default class EncryptWallet extends Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <EncryptWalletForm onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.EncryptWallet" />}>
          <Note>
            <Text id="Settings.CannotContain" />
            :<br />
            <Characters>{' -$/&*|<>'}</Characters>
          </Note>
          <Text id="Settings.NewPassword">
            {p => (
              <FormField connectLabel label={<Text id="Settings.Password" />}>
                <Field
                  component={TextField.RF}
                  name="password"
                  type="password"
                  placeholder={p}
                />
              </FormField>
            )}
          </Text>
          <FormField connectLabel label={<Text id="Settings.Re-Enter" />}>
            <Field
              component={TextField.RF}
              name="passwordRepeat"
              type="password"
              placeholder="Confirm your password"
            />
          </FormField>

          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            waiting={submitting}
            style={{ marginTop: '2em' }}
          >
            <Text id="Settings.EncryptRestart" />
          </Button>
        </FieldSet>
      </EncryptWalletForm>
    );
  }
}
