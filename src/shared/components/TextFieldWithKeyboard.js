// External
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

// Internal
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import store from 'store';
import keyboardIcon from 'icons/keyboard.svg';

export default class TextFieldWithKeyboard extends Component {
  openKeyboard = () => {
    ipcRenderer.invoke('open-virtual-keyboard', {
      theme: store.getState().theme,
      defaultText: this.props.value,
      maskable: this.props.maskable,
      placeholder: this.props.placeholder,
    });
  };

  render() {
    const { maskable, ...rest } = this.props;
    const Component = this.props.maskable ? MaskableTextField : TextField;

    return (
      <Component
        {...rest}
        left={
          <Tooltip.Trigger align="start" tooltip={__('Use virtual keyboard')}>
            <Button skin="plain" onClick={this.openKeyboard} tabIndex="-1">
              <Icon icon={keyboardIcon} />
            </Button>
          </Tooltip.Trigger>
        }
      />
    );
  }
}

// TextFieldWithKeyboard wrapper for redux-form
const TextFieldWithKeyboardReduxForm = ({ input, meta, ...rest }) => (
  <TextFieldWithKeyboard
    error={meta.touched && meta.error}
    {...input}
    {...rest}
  />
);
TextFieldWithKeyboard.RF = TextFieldWithKeyboardReduxForm;
