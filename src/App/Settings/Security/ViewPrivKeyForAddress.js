// External
import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { clipboard } from 'electron';

// Internal
import Icon from 'components/Icon';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import InputGroup from 'components/InputGroup';
import UIController from 'components/UIController';
import Text from 'components/Text';
import rpc from 'lib/rpc';
import copyIcon from 'images/copy.sprite.svg';
import { rpcErrorHandler } from 'utils/form';

/**
 * View Private Keys for Address JSX
 *
 * @class ViewPrivKeyForAddress
 * @extends {Component}
 */
@reduxForm({
  form: 'viewPrivateKey',
  destroyOnUnmount: false,
  initialValues: {
    address: '',
    privateKey: '',
  },
  validate: ({ address }) => {
    const errors = {};
    if (!address) {
      errors.address = <Text id="Settings.Errors.AddressEmpty" />;
    }
    return errors;
  },
  onSubmit: ({ address }) => rpc('dumpprivkey', [address]),
  onSubmitSuccess: (result, dispatch, props) => {
    props.change('privateKey', result);
  },
  onSubmitFail: rpcErrorHandler(<Text id="Settings.Errors.ViewPrivKey" />),
})
class ViewPrivKeyForAddress extends Component {
  privKeyRef = React.createRef();

  /**
   * Show Private Keys
   *
   * @param {*} e
   * @memberof ViewPrivKeyForAddress
   */
  showPrivKey(e) {
    e.preventDefault();
    let address = this.inputRef.value;
    if (address) {
      rpc('dumpprivkey', [address])
        .then(payload => {
          this.outputRef.value = payload;
        })
        .catch(e => {
          if (e.includes(address)) {
            e = e.replace(address + ' ', '');
          }
          UIController.openErrorDialog({ message: e });
        });
    } else {
      this.inputRef.focus();
    }
  }

  /**
   * Copy Private Keys
   *
   * @memberof ViewPrivKeyForAddress
   */
  copyPrivkey = () => {
    const privKey = this.privKeyRef.current.value;
    clipboard.writeText(privKey);
    UIController.showNotification(<Text id="Alert.Copied" />, 'success');
  };

  /**
   * Reset Private Keys
   *
   * @memberof ViewPrivKeyForAddress
   */
  resetPrivateKey = () => {
    this.props.change('privateKey', '');
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof ViewPrivKeyForAddress
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.ViewPrivateKeyForAddress" />}>
          <FormField connectLabel label={<Text id="Settings.Address" />}>
            {inputId => (
              <InputGroup>
                <Text id="Settings.EnterAddressHere">
                  {placeholder => (
                    <Field
                      component={TextField.RF}
                      name="address"
                      id={inputId}
                      placeholder={placeholder}
                      onChange={this.resetPrivateKey}
                    />
                  )}
                </Text>

                <Button
                  type="submit"
                  skin="primary"
                  fitHeight
                  disabled={submitting}
                  waiting={submitting}
                >
                  <Text id="Settings.ViewPrivateKey" />
                </Button>
              </InputGroup>
            )}
          </FormField>

          <FormField label={<Text id="Settings.PrivateKey" />}>
            <InputGroup>
              <Text id="Settings.KeyDisplayHere">
                {placeholder => (
                  <Field
                    component={TextField.RF}
                    name="privateKey"
                    readOnly
                    type="password"
                    placeholder={placeholder}
                    ref={this.privKeyRef}
                  />
                )}
              </Text>
              <Button fitHeight className="relative" onClick={this.copyPrivkey}>
                <Icon icon={copyIcon} className="space-right" />
                <Text id="Settings.Copy" />
              </Button>
            </InputGroup>
          </FormField>
        </FieldSet>
      </form>
    );
  }
}
export default ViewPrivKeyForAddress;
