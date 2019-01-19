// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';

@connect(
  ({
    overview: { connections },
    settings: {
      settings: { manualDaemon },
    },
  }) => ({
    manualDaemon,
    connections,
  })
)
class DaemonStatus extends React.Component {
  render() {
    const { manualDaemon, connections } = this.props;
    return (
      connections === undefined && (
        <span className="dim">
          {manualDaemon && <Text id="Alert.ManualDaemonDown" />}
          {!manualDaemon && (
            <>
              <Text id="Alert.DaemonLoadingWait" />
              ...
            </>
          )}
        </span>
      )
    );
  }
}

export default DaemonStatus;
