// External Dependencies
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-responsive-modal';

// Internal Global Dependencies
import { GetSettings, SaveSettings } from 'api/settings';
import configuration from 'api/configuration';
import UIContext from 'context/ui';

var enoughSpace = true;

const modalOpen = ({
  manualDaemon,
  settings,
  connections,
  isInSync,
  BootstrapModal,
}) =>
  !manualDaemon &&
  ((settings.bootstrap && connections !== undefined && !isInSync) ||
    BootstrapModal);

class Prompting extends Component {
  static contextType = UIContext;
  render() {
    return (
      <>
        <h3>
          <FormattedMessage
            id="ToolTip.DbOption"
            defaultMessage="Would you like to reduce the time it takes to sync by downloading a recent version of the database?"
          />
        </h3>
        {!enoughSpace && (
          <h3
            style={{
              color: '#ff0000',
            }}
          >
            <FormattedMessage
              id="ToolTip.NotEnoughSpace"
              defaultMessage="Not Enough Space, Requires 20gb."
            />
          </h3>
        )}
        <button
          className="button"
          disabled={!enoughSpace}
          onClick={() => {
            this.props.OpenBootstrapModal(true);
            configuration.BootstrapRecentDatabase(this);
            this.props.setPercentDownloaded(0.001);
          }}
        >
          <FormattedMessage
            id="ToolTip.BootStrapIt"
            defaultMessage="Yes, let's bootstrap it"
          />
        </button>
        <button
          className="button"
          onClick={() => {
            this.props.CloseBootstrapModal();
            let settings = GetSettings();
            settings.bootstrap = false;
            SaveSettings(settings);
          }}
        >
          <FormattedMessage
            id="ToolTip.SyncFromScratch"
            defaultMessage="No, let it sync form scratch"
          />
        </button>
      </>
    );
  }
}

const Downloading = props => (
  <>
    <h3>
      <FormattedMessage
        id="ToolTip.RecentDatabaseDownloading"
        defaultMessage="Recent Database Downloading"
      />
    </h3>
    <div className="progress-bar">
      <div
        className="filler"
        style={{ width: `${props.percentDownloaded}%` }}
      />
    </div>
    <h3>
      <FormattedMessage
        id="ToolTip.PleaseWait"
        defaultMessage="Please Wait..."
      />
    </h3>
  </>
);

const Extracting = () => (
  <>
    <h3>
      <FormattedMessage
        id="ToolTip.RecentDatabaseExtracting"
        defaultMessage="Recent Database Extracting"
      />
    </h3>

    <h3>
      <FormattedMessage
        id="ToolTip.PleaseWait"
        defaultMessage="Please Wait..."
      />
    </h3>
  </>
);

const modalContent = props => {
  if (props.percentDownloaded === 0) {
    if (modalOpen(props)) {
      const checkDiskSpace = require('check-disk-space');
      let dir = process.env.APPDATA || process.env.HOME;
      checkDiskSpace(dir).then(diskSpace => {
        if (diskSpace.free <= 20000000000) {
          enoughSpace = false;
          setTimeout(() => {
            this.forceUpdate();
          }, 5000);
        } else {
          enoughSpace = true;
        }
      });
    }
    return <Prompting {...props} />;
  }

  if (props.percentDownloaded < 100) {
    return <Downloading {...props} />;
  }

  return <Extracting />;
};

const BootstrapModal = props => (
  <Modal
    key="bootstrap-modal"
    open={modalOpen(props)}
    onClose={() => true}
    center
    focusTrapped={true}
    showCloseIcon={false}
    classNames={{ modal: 'modal' }}
  >
    {modalContent(props)}
  </Modal>
);

export default BootstrapModal;
