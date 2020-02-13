import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

import HorizontalLine from 'components/HorizontalLine';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModuleIcon from 'components/ModuleIcon';
import { consts, timing } from 'styles';
import { legacyMode } from 'consts/misc';

import logoIcon from 'icons/logo.svg';
import sendIcon from 'icons/send.svg';
import transactionsIcon from 'icons/transaction.svg';
import addressBookIcon from 'icons/address-book.svg';
import settingsIcon from 'icons/settings.svg';
import consoleIcon from 'icons/console.svg';
import userIcon from 'icons/user.svg';

import NavLinkItem from './NavLinkItem';

__ = __context('NavigationBar');

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(70%) }
    to { opacity: 1; transform: translateY(0) }
`;

const Nav = styled.nav({
  gridArea: 'navigation',
  position: 'relative',
  background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)',
});

const NavBar = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 10,
  animation: `${slideUp} ${timing.slow} ${consts.enhancedEaseOut}`,
});

const AboveNav = styled.div({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
});

/**
 * Returns a Nav Item
 * These are prebuild modules
 * @param {*} { icon, children, ...rest }
 * @memberof Navigation
 */
const NavItem = ({ icon, children, ...rest }) => (
  <Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <Icon icon={icon} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

/**
 * Returns a Module Nav Item
 * These are nave items for user installed Modules
 * @param {*} { module }
 * @memberof Navigation
 */
const ModuleNavItem = ({ module }) => (
  <Tooltip.Trigger tooltip={module.info.displayName} position="top">
    <NavLinkItem to={`/Modules/${module.info.name}`}>
      <ModuleIcon module={module} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

const ModuleNavItems = connect(state => ({
  modules: state.modules,
}))(({ modules }) =>
  Object.values(modules)
    .filter(module => module.enabled && module.info.type === 'app')
    .map(module => <ModuleNavItem key={module.info.name} module={module} />)
);

/**
 * Returns the Navigation Bar
 *  @memberof Navigation
 */
const Navigation = () => (
  <Nav>
    <AboveNav>
      <HorizontalLine />
    </AboveNav>

    <NavBar>
      <NavItem icon={logoIcon} exact to="/">
        {__('Overview')}
      </NavItem>

      {!legacyMode && (
        <NavItem icon={userIcon} to="/User">
          {__('User')}
        </NavItem>
      )}

      <NavItem icon={sendIcon} to="/Send">
        {legacyMode ? __('Send NXS') : __('Send')}
      </NavItem>

      <NavItem icon={transactionsIcon} to="/Transactions">
        {__('Transactions')}
      </NavItem>

      <NavItem icon={addressBookIcon} to="/AddressBook">
        {__('Address Book')}
      </NavItem>

      <NavItem icon={settingsIcon} to="/Settings">
        {__('Settings')}
      </NavItem>

      <NavItem icon={consoleIcon} to="/Terminal">
        {__('Console')}
      </NavItem>
      <ModuleNavItems />
    </NavBar>
  </Nav>
);

/**
 *  @class Navigation
 */
export default Navigation;
