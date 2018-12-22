// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import * as RPC from 'scripts/rpc';
import styled from '@emotion/styled';

// Internal
import FormField from 'components/common/FormField';
import TextBox from 'components/common/TextBox';
import Button from 'components/common/Button';
import FieldSet from 'components/common/FieldSet';

const ChangePasswordWrapper = styled.form({
  flex: 2,
  marginRight: '1em',
});

export default class ChangePassword extends Component {
  changePassword(e) {
    e.preventDefault();
    let pass, newPass, passChk, passHint;
    pass = document.getElementById('oldPass');
    newPass = document.getElementById('newPass');
    passChk = document.getElementById('passChk');
    passHint = document.getElementById('passHint');
    if (pass.value.trim()) {
      if (/[-$&/*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(' ') || newPass.value.startsWith(' '))) {
            RPC.PROMISE('walletpassphrasechange', [
              pass.value,
              newPass.value,
            ]).then(payload => {
              if (payload === null) {
                pass.value = '';
                newPass.value = '';
                passChk.value = '';
                this.props.OpenModal('Password has been changed.');
              }
            });
          } else {
            passChk.value = '';
            passHint.innerText = 'Password cannot start or end with spaces';
            passChk.focus();
          }
        } else {
          passChk.value = '';
          passHint.innerText = 'Passwords do not match';
          passChk.focus();
        }
      } else {
        passChk.value = '';
        passHint.style.visibility = 'visible';
        passHint.innerText = 'Passwords cannot contain -$&/*|<>';
        passChk.focus();
      }
    } else {
      passHint.innerText = 'Passwords do not match';
      pass.focus();
    }
  }

  reEnterValidator(e) {
    let newPass = document.getElementById('newPass');
    let passHint = document.getElementById('passHint');
    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = 'hidden';
    } else {
      passHint.style.visibility = 'visible';
    }
  }

  lockWallet() {
    this.props.busy();
    RPC.PROMISE('walletlock', [])
      .then(payload => {
        this.props.wipe();
        this.props.busy();
        RPC.PROMISE('getinfo', [])
          .then(payload => {
            delete payload.timestamp;
            return payload;
          })
          .then(payload => {
            this.props.getInfo(payload);
          });
      })
      .catch(e => {
        this.props.OpenErrorModal(e);
      });
  }

  render() {
    return (
      <ChangePasswordWrapper>
        <FieldSet
          legend={
            <FormattedMessage
              id="Settings.ChangePassword"
              defaultMessage="Change Password"
            />
          }
        >
          <FormField
            label={
              <FormattedMessage
                id="Settings.PreviousPassword"
                defaultMessage="Previous Password"
              />
            }
            hint={
              <FormattedMessage
                id="Settings.PasswordRequired"
                defaultMessage="Password Is Required"
              />
            }
          >
            <FormattedMessage id="Settings.Password" defaultMessage="Password">
              {p => (
                <TextBox
                  type="password"
                  placeholder={p}
                  id="oldPass"
                  required
                />
              )}
            </FormattedMessage>
          </FormField>
          <FormField
            label={
              <FormattedMessage
                id="Settings.NewPassword"
                defaultMessage="New Password"
              />
            }
            hint={
              <FormattedMessage
                id="Settings.PasswordRequired"
                defaultMessage="Password Is Required"
              />
            }
          >
            <FormattedMessage
              id="Settings.NewPassword"
              defaultMessage="New Password"
            >
              {np => (
                <TextBox
                  type="password"
                  placeholder={np}
                  id="newPass"
                  required
                />
              )}
            </FormattedMessage>
          </FormField>
          <FormField
            label={
              <FormattedMessage
                id="Settings.ReEnterPassword"
                defaultMessage="Re-Enter Password:"
              />
            }
            hint={
              <FormattedMessage
                id="Settings.NoMatch"
                defaultMessage="Passwords do not match"
              />
            }
          >
            <FormattedMessage
              id="Settings.ReEnterPassword"
              defaultMessage="Re-Enter Password:"
            >
              {rep => (
                <TextBox
                  type="password"
                  placeholder={rep}
                  id="passChk"
                  onChange={e => this.reEnterValidator(e)}
                />
              )}
            </FormattedMessage>
          </FormField>
          {/* temporary workaround to avoid error */}
          <span id="passHint" style={{ display: 'none' }} />
          {/* <span id="passHint" className="err invalid">
                <FormattedMessage
                  id="Settings.NoMatch"
                  defaultMessage="Passwords do not match"
                />
              </span> */}

          <Button
            primary
            wide
            style={{ marginTop: '2em' }}
            onClick={() => this.changePassword(e)}
          >
            <FormattedMessage id="Settings.Submit" defaultMessage="Submit" />
          </Button>
        </FieldSet>

        <Button
          filled
          darkGray
          wide
          onClick={e => {
            e.preventDefault();
            this.lockWallet();
          }}
        >
          <FormattedMessage
            id="Settings.LockWallet"
            defaultMessage="Lock Wallet"
          />
        </Button>
      </ChangePasswordWrapper>
    );
  }
}
