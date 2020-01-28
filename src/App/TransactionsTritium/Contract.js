import React from 'react';
import styled from '@emotion/styled';

import Tooltip from 'components/Tooltip';
import ContractDetailsModal from 'components/ContractDetailsModal';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import { formatNumber } from 'lib/intl';
import { getDeltaSign } from 'lib/tritiumTransactions';
import { consts, timing } from 'styles';
import * as color from 'utils/color';

__ = __context('Transactions');

const ContractComponent = styled.div(({ theme }) => ({
  flexGrow: 1,
  padding: '.6em 1em',
  width: '100%',
  display: 'grid',
  gridTemplateAreas: '"content delta"',
  gridTemplateColumns: '1fr max-content',
  gridColumnGap: '1em',
  alignItems: 'center',
  cursor: 'pointer',
  transition: `background ${timing.normal}`,
  '&:hover': {
    background: color.lighten(theme.background, 0.2),
  },
}));

const ContractContent = styled.div({
  gridArea: 'content',
});

const ContractDelta = styled.div(({ theme, sign }) => ({
  gridArea: 'delta',
  fontSize: '1.2em',
  justifySelf: 'end',
  color:
    sign === '+'
      ? theme.primary
      : sign === '-'
      ? theme.danger
      : theme.foreground,
  '&::before': sign && {
    content: `"${sign}"`,
  },
}));

const Operation = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
  textTransform: 'uppercase',
}));

const Info = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const AccountName = styled(Info)(({ theme }) => ({
  paddingBottom: '.15em ',
  borderBottom: `1px dotted ${theme.mixer(0.25)}`,
}));

const HashComponent = styled(Info)(({ theme }) => ({
  fontFamily: consts.monoFontFamily,
  paddingBottom: '.15em ',
  borderBottom: `1px dotted ${theme.mixer(0.25)}`,
}));

const RegisterType = styled(Info)({
  textTransform: 'lowercase',
});

const Hash = ({ children, ...rest }) => {
  if (!children || typeof children !== 'string' || children.length <= 11)
    return <span {...rest}>{children}</span>;
  return (
    <Tooltip.Trigger tooltip={children}>
      <HashComponent {...rest}>
        {children.slice(0, 6)}...{children.slice(-5)}
      </HashComponent>
    </Tooltip.Trigger>
  );
};

const Account = ({ name, address }) =>
  name ? (
    <>
      account{' '}
      <Tooltip.Trigger tooltip={address}>
        <AccountName>{name}</AccountName>
      </Tooltip.Trigger>
    </>
  ) : (
    <>
      address <Hash>{address}</Hash>
    </>
  );

const creditFrom = contract => {
  switch (contract.for) {
    case 'DEBIT':
      return <Account name={contract.from_name} address={contract.from} />;

    case 'LEGACY':
      return <Info>{__('Legacy transaction')}</Info>;

    case 'COINBASE':
      return <Info>{__('Coinbase transaction')}</Info>;

    default:
      return '';
  }
};

const contractContent = contract => {
  switch (contract.OP) {
    case 'WRITE': {
      return (
        <>
          <Operation>Write</Operation> data to{' '}
          <Account address={contract.address} />
        </>
      );
    }

    case 'APPEND': {
      return (
        <>
          <Operation>Append</Operation> data to{' '}
          <Account address={contract.address} />
        </>
      );
    }

    case 'CREATE': {
      return (
        <>
          <div>
            <Operation>Create</Operation> new{' '}
            <RegisterType>
              {contract.type === 'OBJECT' && contract.object_type + ' '}
              {contract.type}
            </RegisterType>{' '}
            register
          </div>
          <div>
            at address <Hash>{contract.address}</Hash>
          </div>
        </>
      );
    }

    case 'TRANSFER': {
      return (
        <>
          <Operation>Transfer</Operation> ownership of{' '}
          <Account address={contract.address} /> to{' '}
          <Account address={contract.destination} />
        </>
      );
    }

    case 'CLAIM': {
      return (
        <>
          <Operation>Claim</Operation> ownership of{' '}
          <Account address={contract.address} />
        </>
      );
    }

    case 'COINBASE': {
      return (
        <>
          <Operation>Coinbase</Operation>
        </>
      );
    }

    case 'TRUST': {
      return (
        <>
          <Operation>Trust</Operation>
        </>
      );
    }

    case 'GENESIS': {
      return (
        <>
          <Operation>Genesis</Operation> <Hash>{contract.address}</Hash>
        </>
      );
    }

    case 'DEBIT': {
      return (
        <>
          <div>
            <Operation>Debit</Operation> from{' '}
            <Account name={contract.from_name} address={contract.from} />
          </div>
          <div>
            to <Account name={contract.to_name} address={contract.to} />
          </div>
        </>
      );
    }

    case 'CREDIT': {
      return (
        <>
          <div>
            <Operation>Credit</Operation> to{' '}
            <Account name={contract.to_name} address={contract.to} />
          </div>
          <div>from {creditFrom(contract)}</div>
        </>
      );
    }

    case 'MIGRATE': {
      return (
        <>
          <div>
            <Operation>Migrate</Operation> trust key to{' '}
            <Account name={contract.account_name} address={contract.account} />
          </div>
          <div>
            from <Hash>{contract.hashkey}</Hash>
          </div>
        </>
      );
    }

    case 'AUTHORIZE': {
      return (
        <>
          <div>
            <Operation>Authorize</Operation> transaction{' '}
            <Hash>{contract.txid}</Hash>
          </div>
          <div>
            with a temporal proof <Hash>{contract.proof}</Hash>
          </div>
        </>
      );
    }

    case 'FEE': {
      return (
        <>
          <Operation>Fee</Operation> from{' '}
          <Account name={contract.from_name} address={contract.from} />
        </>
      );
    }

    case 'LEGACY': {
      return (
        <>
          <div>
            <Operation>Legacy</Operation> debit from{' '}
            <Account name={contract.from_name} address={contract.from} />
          </div>
          <div>
            to <Account address={contract.to} />
          </div>
        </>
      );
    }

    default: {
      return <Operation>{contract.OP}</Operation>;
    }
  }
};

const Contract = ({ contract, txid }) => (
  <ContractComponent
    onClick={() => openModal(ContractDetailsModal, { contract, txid })}
    onContextMenu={e => {
      e.stopPropagation();
      popupContextMenu([
        {
          id: 'contract-details',
          label: __('View contract details'),
          click: () => {
            openModal(ContractDetailsModal, { contract, txid });
          },
        },
        {
          id: 'tx-details',
          label: __('View transaction details'),
          click: () => {
            openModal(TransactionDetailsModal, { txid });
          },
        },
      ]);
    }}
  >
    <ContractContent>{contractContent(contract)}</ContractContent>
    {!!contract.amount && (
      <ContractDelta sign={getDeltaSign(contract)}>
        {formatNumber(contract.amount)} {contract.token_name || 'NXS'}
      </ContractDelta>
    )}
  </ContractComponent>
);

export default Contract;
