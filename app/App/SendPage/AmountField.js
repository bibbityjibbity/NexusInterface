// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { getNxsFiatPrice } from './selectors';

const floatRegex = /^[0-9]+(.[0-9]*)?$/;

const SendAmount = styled.div({
  display: 'flex',
});

const SendAmountField = styled.div({
  flex: 1,
});

const SendAmountEqual = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .6em',
  fontSize: '1.2em',
});

const mapStateToProps = ({
  settings: { fiatCurrency },
  common: { rawNXSvalues },
}) => ({
  fiatCurrency: fiatCurrency,
  nxsFiatPrice: getNxsFiatPrice(rawNXSvalues, fiatCurrency),
});

@connect(mapStateToProps)
export default class AmountField extends Component {
  nxsToFiat = (e, value) => {
    if (floatRegex.test(value)) {
      const nxs = parseFloat(value);
      const { nxsFiatPrice } = this.props;
      if (nxsFiatPrice) {
        const fiat = nxs * nxsFiatPrice;
        this.props.change('fiatAmount', fiat.toFixed(2));
      }
    }
  };

  fiatToNxs = (e, value) => {
    if (floatRegex.test(value)) {
      const fiat = parseFloat(value);
      const { nxsFiatPrice } = this.props;
      if (nxsFiatPrice) {
        const nxs = fiat / nxsFiatPrice;
        this.props.change('amount', nxs.toFixed(5));
      }
    }
  };

  render() {
    return (
      <SendAmount>
        <SendAmountField>
          <FormField connectLabel label={<Text id="sendReceive.Amount" />}>
            <Field
              component={TextField.RF}
              name="amount"
              placeholder="0.00000"
              onChange={this.nxsToFiat}
            />
          </FormField>
        </SendAmountField>

        <SendAmountEqual>=</SendAmountEqual>

        <SendAmountField>
          <FormField connectLabel label={this.props.fiatCurrency}>
            <Field
              component={TextField.RF}
              name="fiatAmount"
              placeholder="0.00"
              onChange={this.fiatToNxs}
            />
          </FormField>
        </SendAmountField>
      </SendAmount>
    );
  }
}
