import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import AdjustStakeModal from 'components/AdjustStakeModal';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'actions/overlays';
import { formatNumber } from 'lib/intl';

import { totalBalance } from './utils';

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 2fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

const AccountDetailsModal = ({ account, stakeInfo, openModal }) => (
  <Modal>
    <Modal.Header>{__('Account Details')}</Modal.Header>
    <Modal.Body>
      <Field label={__('Account name')}>{account.name}</Field>
      <Field label={__('Created time')}>
        {formatDateTime(account.created * 1000, timeFormatOptions)}
      </Field>
      <Field label={__('Last modified')}>
        {formatDateTime(account.modified * 1000, timeFormatOptions)}
      </Field>
      <Field label={__('Token name')}>{account.token_name}</Field>
      <Field label={__('Total account balance')}>
        {formatNumber(totalBalance(account), 20)} {account.token_name}
      </Field>
      <Field label={__('Available balance')}>
        {formatNumber(account.balance, 20)} {account.token_name}
      </Field>
      <Field label={__('Pending balance')}>
        {formatNumber(account.pending, 20)} {account.token_name}
      </Field>
      <Field label={__('Unconfirmed balance')}>
        {formatNumber(account.unconfirmed, 20)} {account.token_name}
      </Field>
      {account.stake !== undefined && (
        <Field label={__('Stake balance')}>
          {formatNumber(account.stake, 20)} {account.token_name}
        </Field>
      )}
      {account.immature !== undefined && (
        <Field label={__('Immature balance')}>
          {formatNumber(account.immature, 20)} {account.token_name}
        </Field>
      )}
      <Field label={__('Address')}>
        <span className="monospace">{account.address}</span>
      </Field>

      {account.stake !== undefined && (
        <div className="mt1 flex space-between">
          <div />
          <Button
            disabled={!stakeInfo || (!stakeInfo.stake && !stakeInfo.balance)}
            onClick={() => {
              openModal(AdjustStakeModal);
            }}
          >
            {__('Adjust stake amount')}
          </Button>
        </div>
      )}
    </Modal.Body>
  </Modal>
);

const mapStateToProps = state => ({
  stakeInfo: state.core.stakeInfo,
});

const actionCreators = {
  openModal,
};

export default connect(
  mapStateToProps,
  actionCreators
)(AccountDetailsModal);
