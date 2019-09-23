// External
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import { consts, timing, animations } from 'styles';
import * as color from 'utils/color';
import { isCoreConnected } from 'selectors';
import { legacyMode } from 'consts/misc';

// Internal Local
import StatusIcons from './StatusIcons';
import StatusIconsTritium from './StatusIconsTritium';
import WalletStatus from './WalletStatus';
import TritiumCountdown from './TritiumCountdown';
import logoFull from './logo-full-beta.sprite.svg';

const HeaderComponent = styled.header(({ theme }) => ({
  gridArea: 'header',
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)',
  color: theme.primary,
  zIndex: 1,
}));

const LogoLink = styled(Link)(({ theme }) => ({
  position: 'relative',
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${consts.enhancedEaseOut}`,
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',
  filter: `drop-shadow(0 0 8px ${color.fade(
    color.lighten(theme.primary, 0.2),
    0.3
  )})`,

  '&:hover': {
    filter: `drop-shadow(0 0 10px ${theme.primary}) brightness(110%)`,
  },
}));

const Logo = styled(Icon)(({ theme }) => ({
  display: 'block',
  height: 50,
  width: 'auto',
  fill: theme.primary,
}));

const UnderHeader = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: theme.foreground,
}));

const ModeDisplay = styled.div({
  position: 'absolute',
  bottom: '-0px',
});

const PreReleaseTag = styled.div(({ theme }) => ({
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -32,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: theme.foreground,
}));

const preReleaseTag = APP_VERSION.toString().includes('alpha')
  ? 'ALPHA'
  : APP_VERSION.toString().includes('beta')
  ? 'BETA'
  : null;

/**
 * Handles the App Header
 *
 * @class Header
 * @extends {Component}
 */
@connect(state => ({ coreConnected: isCoreConnected(state) }))
class Header extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Header
   */
  render() {
    const { coreConnected } = this.props;

    return (
      <HeaderComponent>
        {legacyMode && <TritiumCountdown />}

        <LogoLink to="/">
          <Logo icon={logoFull} />

          {preReleaseTag ? (
            <PreReleaseTag>{preReleaseTag}</PreReleaseTag>
          ) : null}
        </LogoLink>

        <UnderHeader>
          <HorizontalLine />
          <WalletStatus {...this.props} />
        </UnderHeader>
        <ModeDisplay>
          {legacyMode ? 'Legacy Mode' : 'Tritium Mode'}{' '}
        </ModeDisplay>
        {coreConnected &&
          (legacyMode ? <StatusIcons /> : <StatusIconsTritium />)}
      </HeaderComponent>
    );
  }
}

export default Header;
