// External
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from '@emotion/styled';

// Internal Global
import * as actionsCreators from 'actions/headerActionCreators';
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import { consts, timing, animations } from 'styles';
import { color } from 'utils';

// Internal Local
import BootstrapModal from './BootstrapModal';
import SignInStatus from './StatusIcons/SignInStatus';
import StakingStatus from './StatusIcons/StakingStatus';
import SyncStatus from './StatusIcons/SyncStatus';
import DaemonStatus from './DaemonStatus';
import logoFull from './logo-full-beta.sprite.svg';
import './style.css';

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
  zIndex: 999,
}));

const LogoLink = styled(Link)(({ theme }) => ({
  position: 'relative',
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${
    consts.enhancedEaseOut
  }`,
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
  filter: 'var(--nxs-logo)',
  fill: theme.primary,
}));

const Beta = styled.div(({ theme }) => ({
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -26,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: theme.light,
}));

const StatusIcons = styled.div({
  position: 'absolute',
  top: 24,
  right: 40,
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
});

const UnderHeader = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: theme.light,
}));

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings,
    ...state.intl,
  };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Header extends Component {
  render() {
    const { connections } = this.props;

    return (
      <HeaderComponent>
        <BootstrapModal {...this.props} />

        <LogoLink to="/">
          <Logo icon={logoFull} />
          <Beta>BETA</Beta>
        </LogoLink>

        <UnderHeader>
          <HorizontalLine />
          <DaemonStatus {...this.props} />
        </UnderHeader>

        {connections !== undefined && (
          <StatusIcons>
            <SyncStatus {...this.props} />
            <SignInStatus {...this.props} />
            {this.props.history.location.pathname !== '/' ? (
              <StakingStatus {...this.props} />
            ) : (
              <Icon />
            )}
          </StatusIcons>
        )}
      </HeaderComponent>
    );
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
