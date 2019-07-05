// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';

import stakingIcon from 'images/staking.sprite.svg';

/**
 * Handles the Staking Status
 *
 * @class StakingStatus
 * @extends {React.Component}
 */
@connect(
  ({
    core: {
      info: { stakeweight, interestweight, trustweight, blockweight },
    },
    router: { location },
  }) => ({
    stakeweight,
    interestweight,
    trustweight,
    blockweight,
    location,
  })
)
class StakingStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof StakingStatus
   */
  render() {
    const {
      stakeweight,
      interestweight,
      trustweight,
      blockweight,
      location,
    } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          <div>
            <div>
              <Text id="Header.StakeWeight" />: {stakeweight}%
            </div>
            <div>
              <Text id="Header.InterestRate" />: {interestweight}%
            </div>
            <div>
              <Text id="Header.TrustWeight" />: {trustweight}%
            </div>
            <div>
              <Text id="Header.BlockWeight" />: {blockweight}
            </div>
          </div>
        }
        style={{ textAlign: 'left' }}
      >
        <StatusIcon icon={stakingIcon} />
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
