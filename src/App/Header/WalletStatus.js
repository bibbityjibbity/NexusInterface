// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Link from 'components/Link';
import { isCoreConnected } from 'selectors';

/**
 * Handles the Core Status
 *
 * @class WalletStatus
 * @extends {React.Component}
 */
@connect(state => ({
  manualDaemon: state.settings.manualDaemon,
  autoConnect: state.core.autoConnect,
  coreConnected: isCoreConnected(state),
  loggedIn: !!state.currentUser,
}))
class WalletStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof WalletStatus
   */
  render() {
    const { manualDaemon, coreConnected, autoConnect, loggedIn } = this.props;
    return !coreConnected ? (
      <span className="dim">
        {manualDaemon
          ? __('Manual Core is disconnected')
          : autoConnect
          ? __('Connecting to Nexus Core...')
          : __('Nexus Core is stopped')}
      </span>
    ) : (
      !loggedIn && <span className="dim">{__("You're not logged in")}. </span>
    );
  }
}

export default WalletStatus;
