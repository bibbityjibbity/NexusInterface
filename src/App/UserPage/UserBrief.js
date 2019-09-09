import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

import { timing, consts } from 'styles';
import * as color from 'utils/color';

const UserBriefComponent = styled.div(({ theme }) => ({
  width: 300,
  paddingRight: 30,
  borderRight: `1px solid ${theme.mixer(0.125)}`,
}));

const UserInfo = styled.div(({ theme }) => ({
  textAlign: 'center',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const Separator = styled.div(({ theme }) => ({
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  margin: '5px 0',
}));

const Username = styled.div(({ theme }) => ({
  color: theme.primary,
  textAlign: 'center',
  fontSize: 30,
  padding: '20px 0',
}));

const Genesis = styled.div({
  textAlign: 'center',
  opacity: 0.7,
  fontSize: '.8em',
  padding: '10px',
});

const GenesisId = styled.div({
  wordBreak: 'break-all',
  fontFamily: consts.monoFontFamily,
});

const MenuItem = styled(NavLink)(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '.5em 30px',
    margin: '0 -30px',
    transitionProperty: 'background, color',
    transitionDuration: timing.normal,
    cursor: 'pointer',

    '&:hover': {
      background: theme.mixer(0.05),
    },

    '&.active, &.active:hover': {
      background: theme.primary,
      color: theme.primaryAccent,
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.fade(theme.primary, 0.4),
        color: theme.primaryAccent,
      },
    }
);

const UserBrief = ({ userStatus, match }) => (
  <UserBriefComponent>
    <Username>{userStatus.username}</Username>
    <Separator />
    <Genesis>
      <div>{__('Genesis ID')}:</div>
      <GenesisId>{userStatus.genesis}</GenesisId>
    </Genesis>
    <Separator />
    <MenuItem to={`${match.url}/Balances`}>{__('Balances')}</MenuItem>
    <MenuItem to={`${match.url}/Staking`}>{__('Staking')}</MenuItem>
    <MenuItem to={`${match.url}/Accounts`}>{__('Accounts')}</MenuItem>
  </UserBriefComponent>
);

const mapStateToProps = state => ({
  userStatus: state.core.userStatus,
});

export default connect(mapStateToProps)(UserBrief);
