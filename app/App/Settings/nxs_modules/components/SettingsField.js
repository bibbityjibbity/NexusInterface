// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import { newUID } from 'utils';

const indentSpace = 20;

const Field = styled.div(({ indent = 0, theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1em 0',
  borderBottom: `1px solid ${theme.darkerGray}`,
  marginLeft: indent * indentSpace,
}));

const Label = styled.label(
  {
    position: 'relative',
    paddingRight: '3em',
    flexShrink: 0,
  },
  ({ indent = 0 }) => ({
    width: 400 - indent * indentSpace,
  })
);

const SubLabel = styled.div(({ theme }) => ({
  fontSize: '.9em',
  color: theme.lightGray,
}));

const Input = styled.div({
  flexGrow: 1,
});

class SettingsField extends Component {
  inputId = newUID();

  settingsInput = () => {
    const { connectLabel, children } = this.props;
    if (connectLabel) {
      if (typeof children === 'function') {
        return children(this.inputId);
      } else {
        return React.cloneElement(React.Children.only(children), {
          id: this.inputId,
        });
      }
    }

    return children;
  };

  render() {
    const {
      label,
      subLabel,
      connectLabel,
      children,
      indent,
      ...rest
    } = this.props;
    return (
      <Field indent={indent} {...rest}>
        <Label
          htmlFor={connectLabel ? this.inputId : undefined}
          indent={indent}
        >
          <div>{label}</div>
          {subLabel && <SubLabel>{subLabel}</SubLabel>}
        </Label>
        <Input>{this.settingsInput()}</Input>
      </Field>
    );
  }
}

export default SettingsField;
