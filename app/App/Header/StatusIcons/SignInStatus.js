// @jsx jsx
// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import Text from 'components/Text';
import { withTheme } from 'emotion-theming';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import StatusIcon from './StatusIcon';

// Images
import questionMarkIcon from 'images/question-mark.sprite.svg';
import lockedIcon from 'images/padlock.sprite.svg';
import unlockedIcon from 'images/padlock-open.sprite.svg';

class SignInStatus extends Component {
  signInStatusMessage = () => {
    const {
      connections,
      daemonAvailable,
      unlocked_until,
      minting_only,
      staking_only,
    } = this.props;
    let unlockDate = new Date(unlocked_until * 1000).toLocaleString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (connections === undefined || !daemonAvailable) {
      return (
        <div>
          <div>Unknown Lock Status</div>
          <div>Waiting for daemon to load...</div>
        </div>
      );
    }

    if (unlocked_until === undefined) {
      return <Text id="Header.WalletUnencrypted" />;
    } else if (unlocked_until === 0) {
      return <Text id="Header.WalletLocked" />;
    } else if (unlocked_until >= 0) {
      if (staking_only) {
        return (
          <>
            <Text id="Header.UnlockedUntil" /> {unlockDate}{' '}
            <Text id="Header.StakingOnly" />
          </>
        );
      } else {
        return (
          <>
            <Text id="Header.UnlockedUntil" /> {unlockDate}
          </>
        );
      }
    }
  };

  statusIcon = () => {
    const { connections, daemonAvailable, unlocked_until, theme } = this.props;
    if (connections === undefined || !daemonAvailable) {
      return <StatusIcon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
    } else {
      if (unlocked_until === undefined) {
        return <StatusIcon icon={unlockedIcon} css={{ color: theme.error }} />;
      } else if (unlocked_until === 0) {
        return <StatusIcon icon={lockedIcon} />;
      } else if (unlocked_until >= 0) {
        return <StatusIcon icon={unlockedIcon} />;
      }
    }
  };

  render() {
    return (
      <Tooltip.Trigger tooltip={this.signInStatusMessage()}>
        <StatusIcon.Wrapper>{this.statusIcon()}</StatusIcon.Wrapper>
      </Tooltip.Trigger>
    );
  }
}

export default withTheme(SignInStatus);
