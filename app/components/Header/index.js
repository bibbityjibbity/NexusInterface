// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import electron from 'electron';
import Modal from 'react-responsive-modal';
import CustomProperties from 'react-custom-properties';
import log from 'electron-log';
import path from 'path';
import styled from '@emotion/styled';
import { FormattedMessage } from 'react-intl';
import { write } from 'fs';

// Internal Global Dependencies
import MenuBuilder from 'menu';
import * as TYPE from 'actions/actiontypes';
import * as RPC from 'scripts/rpc';
import * as actionsCreators from 'actions/headerActionCreators';
import { GetSettings, SaveSettings } from 'api/settings';
import configuration from 'api/configuration';
import Icon from 'components/Icon';
import HorizontalLine from 'components/HorizontalLine';
import { colors, consts, timing, animations } from 'styles';
import { fade, lighten } from 'utils/colors';

// Internal Local Dependencies
import NotificationModal from './NotificationModal';
import ErrorModal from './ErrorModal';
import BootstrapModal from './BootstrapModal';
import SignInStatus from './StatusIcons/SignInStatus';
import StakingStatus from './StatusIcons/StakingStatus';
import SyncStatus from './StatusIcons/SyncStatus';
import DaemonStatus from './DaemonStatus';
import logoFull from './logo-full-beta.sprite.svg';
import './style.css';

const HeaderWrapper = styled.header({
  gridArea: 'header',
  position: 'relative',
  top: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.primary,
  background: 'linear-gradient(to bottom, rgb(0,0,0), rgba(0,0,0,.5))',
  zIndex: 999,
});

const LogoLink = styled(Link)({
  position: 'relative',
  animation: `${animations.fadeInAndExpand} ${timing.slow} ${
    consts.enhancedEaseOut
  }`,
  filter: `drop-shadow(0 0 8px ${fade(lighten(colors.primary, 0.2), 0.3)})`,
  transitionProperty: 'filter',
  transitionDuration: timing.normal,
  transitionTimingFunction: 'ease-out',

  '&:hover': {
    filter: `drop-shadow(0 0 10px ${colors.primary}) brightness(110%)`,
  },
});

const Logo = styled(Icon)({
  display: 'block',
  height: 50,
  width: 'auto',
  filter: 'var(--nxs-logo)',
  fill: colors.primary,
});

const Beta = styled.div({
  color: colors.light,
  fontSize: 12,
  position: 'absolute',
  bottom: 3,
  right: -26,
  letterSpacing: 1,
  textTransform: 'uppercase',
});

const StatusIcons = styled.div({
  position: 'absolute',
  top: 24,
  right: 40,
  animation: `${animations.fadeIn} ${timing.slow} ${consts.enhancedEaseOut}`,
  display: 'flex',
  alignItems: 'center',
});

const UnderHeader = styled.div({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  textAlign: 'center',
  color: colors.light,
});

var tray = tray || null;
let mainWindow = electron.remote.getCurrentWindow();
var checkportinterval; // shouldbemoved

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
  // React Method (Life cycle hook)
  componentDidMount() {
    var self = this;
    const menuBuilder = new MenuBuilder(electron.remote.getCurrentWindow().id);
    menuBuilder.buildMenu(self);

    if (tray === null) this.setupTray(self);
    let settings = GetSettings();

    if (Object.keys(settings).length < 1) {
      SaveSettings({ ...this.props.settings, keepDaemon: false });
      this.props.SwitchMessages(this.props.settings.locale);
    } else {
      this.props.SwitchMessages(settings.locale);
      this.props.setSettings(settings);
    }

    mainWindow.on('close', e => {
      e.preventDefault();
      this.props.clearOverviewVariables();
      this.props.OpenModal('Closing Nexus');
    });

    this.props.SetMarketAveData();
    this.props.LoadAddressBook();
    this.props.GetInfoDump();

    self.set = setInterval(function() {
      self.props.AddRPCCall('getInfo');
      self.props.GetInfoDump();
    }, 20000);
    const core = electron.remote.getGlobal('core');
    this.props.SetMarketAveData();
    self.mktData = setInterval(function() {
      console.log('MARKET');
      self.props.SetMarketAveData();
    }, 900000);

    this.props.history.push('/');
  }
  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (nextProps.unlocked_until === undefined) {
      this.props.Unlock();
      this.props.Unencrypted();
    } else if (nextProps.unlocked_until === 0) {
      this.props.Lock();
      this.props.Encrypted();
    } else if (nextProps.unlocked_until >= 0) {
      this.props.Unlock();
      this.props.Encrypted();
    }

    if (
      this.props.connections === undefined &&
      nextProps.connections !== undefined
    ) {
      this.loadMyAccounts();
    }

    if (nextProps.blocks !== this.props.blocks) {
      RPC.PROMISE('getpeerinfo', [], this.props)
        .then(peerresponse => {
          let hpb = 0;
          peerresponse.forEach(element => {
            if (element.height >= hpb) {
              hpb = element.height;
            }
          });

          return hpb;
        })
        .then(hpb => {
          this.props.SetHighestPeerBlock(hpb);
        });
    }

    if (this.props.heighestPeerBlock > nextProps.blocks) {
      this.props.SetSyncStatus(false);
    } else {
      this.props.SetSyncStatus(true);
    }

    if (this.props.txtotal < nextProps.txtotal) {
      RPC.PROMISE('listtransactions').then(payload => {
        let MRT = payload.reduce((a, b) => {
          if (a.time > b.time) {
            return a;
          } else {
            return b;
          }
        });

        if (MRT.category === 'receive') {
          this.doNotify('Received', MRT.amount + ' NXS');
          this.props.OpenModal('receive');
        } else if (MRT.category === 'send') {
          this.doNotify('Sent', MRT.amount + ' NXS');
          this.props.OpenModal('send');
        } else if (MRT.category === 'genesis') {
          this.doNotify('Genesis', MRT.amount + ' NXS');
          this.props.OpenModal('genesis');
        } else if (MRT.category === 'trust') {
          this.doNotify('Trust', MRT.amount + ' NXS');
          this.props.OpenModal('trust');
        }
      });
    } else {
      return null;
    }
  }

  // Class methods
  loadMyAccounts() {
    RPC.PROMISE('listaccounts', [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE('getaddressesbyaccount', [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE('validateaddress', [address])
            );
          });
        });

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = [];
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele;
                }
              });
              let indexDefault = accountsList.findIndex(ele => {
                if (ele.account == '' || ele.account == 'default') {
                  return ele;
                }
              });

              if (e.account === '' || e.account === 'default') {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: 'default',
                    addresses: [e.address],
                  });
                } else {
                  accountsList[indexDefault].addresses.push(e.address);
                }
              } else {
                if (index === -1) {
                  accountsList.push({
                    account: e.account,
                    addresses: [e.address],
                  });
                } else {
                  accountsList[index].addresses.push(e.address);
                }
              }
            }
          });
          this.props.MyAccountsList(accountsList);
        });
      });
    });
  }

  doNotify(context, message) {
    Notification.requestPermission().then(result => {
      var myNotification = new Notification(context, {
        body: message,
      });
    });
  }

  setupTray(self) {
    console.log(self);
    let trayImage = '';
    let mainWindow = electron.remote.getCurrentWindow();
    console.log(this);
    const path = require('path');
    const app = electron.app || electron.remote.app;

    if (process.env.NODE_ENV === 'development') {
      if (process.platform == 'darwin') {
        trayImage = path.join(
          __dirname,
          'images',
          'tray',
          'Nexus_Tray_Icon_Template_16.png'
        );
      } else {
        trayImage = path.join(
          __dirname,
          'images',
          'tray',
          'Nexus_Tray_Icon_32.png'
        );
      }
    } else {
      if (process.platform == 'darwin') {
        trayImage = path.join(
          configuration.GetAppResourceDir(),
          'images',
          'tray',
          'Nexus_Tray_Icon_Template_16.png'
        );
      } else {
        trayImage = path.join(
          configuration.GetAppResourceDir(),
          'images',
          'tray',
          'Nexus_Tray_Icon_32.png'
        );
      }
    }

    tray = new electron.remote.Tray(trayImage);

    if (process.env.NODE_ENV === 'development') {
      if (process.platform == 'darwin') {
        tray.setPressedImage(
          path.join(
            __dirname,
            'images',
            'tray',
            'Nexus_Tray_Icon_Highlight_16.png'
          )
        );
      }
    } else {
      tray.setPressedImage(
        path.join(
          configuration.GetAppResourceDir(),
          'images',
          'tray',
          'Nexus_Tray_Icon_Highlight_16.png'
        )
      );
    }
    tray.on('double-click', () => {
      mainWindow.show();
    });

    var contextMenu = electron.remote.Menu.buildFromTemplate([
      {
        label: 'Show Nexus',
        click: function() {
          mainWindow.show();
        },
      },
      {
        label: 'Quit Nexus',
        click() {
          self.props.clearOverviewVariables();
          self.props.OpenModal('Closing Nexus');
          mainWindow.close();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
  }

  signInStatus() {
    if (
      this.props.connections === undefined ||
      this.props.daemonAvailable === false
    ) {
      return questionmark;
    } else {
      if (this.props.unlocked_until === undefined) {
        return unencryptedImg;
      } else if (this.props.unlocked_until === 0) {
        return lockedImg;
      } else if (this.props.unlocked_until >= 0) {
        return unlockImg;
      }
    }
  }

  signInStatusMessage() {
    let unlockDate = new Date(this.props.unlocked_until * 1000).toLocaleString(
      'en',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
    if (
      this.props.connections === undefined ||
      this.props.daemonAvailable === false
    ) {
      return (
        <FormattedMessage
          id="Header.DaemonNotLoaded"
          defaultMessage="Daemon Not Loaded"
        />
      );
    }

    if (this.props.unlocked_until === undefined) {
      return (
        <FormattedMessage
          id="Header.WalletUnencrypted"
          defaultMessage="Wallet Unencrypted"
        />
      );
    } else if (this.props.unlocked_until === 0) {
      return (
        <FormattedMessage
          id="Header.WalletLocked"
          defaultMessage="Wallet Locked"
        />
      );
    } else if (this.props.unlocked_until >= 0) {
      if (this.props.staking_only) {
        return (
          <div>
            <FormattedMessage
              id="Header.UnlockedUntil"
              defaultMessage="Unlocked Until"
            />{' '}
            {unlockDate}{' '}
            <FormattedMessage
              id="Header.StakingOnly"
              defaultMessage="Staking Only"
            />
          </div>
        );
      } else {
        return (
          <div>
            <FormattedMessage
              id="Header.UnlockedUntil"
              defaultMessage="Unlocked Until"
            />{' '}
            {unlockDate}
          </div>
        );
      }
    }
  }

  syncStatus() {
    let syncStatus = document.getElementById('syncStatus');
    if (
      this.props.connections === undefined ||
      this.props.heighestPeerBlock > this.props.blocks ||
      this.props.daemonAvailable === false
    ) {
      // rotates
      syncStatus.classList.remove('sync-img');
      return statBad;
    } else {
      // doesn't
      return statGood;
    }
  }

  returnSyncStatusTooltip() {
    if (
      this.props.connections === undefined ||
      this.props.daemonAvailable === false
    ) {
      return (
        <FormattedMessage
          id="Header.DaemonNotLoaded"
          defaultMessage="Daemon Not Loaded"
        />
      );
    } else {
      if (this.props.heighestPeerBlock > this.props.blocks) {
        return (
          this.props.messages['Header.Synching'] +
          (this.props.heighestPeerBlock - this.props.blocks).toString() +
          this.props.messages['Header.Blocks']
        );
      } else {
        return <FormattedMessage id="Header.Synced" defaultMessage="Synced" />;
      }
    }
  }

  modalinternal() {
    switch (this.props.modaltype) {
      case 'receive':
        return (
          <h2>
            <FormattedMessage
              id="Alert.Received"
              defaultMessage="Transaction Received"
            />
          </h2>
        );
        break;
      case 'send':
        return (
          <h2>
            <FormattedMessage
              id="Alert.Sent"
              defaultMessage="Transaction Sent"
            />
          </h2>
        );
        break;
      case 'genesis':
        return (
          <h2>
            <FormattedMessage
              id="Alert.Genesis"
              defaultMessage="Genesis Transaction"
            />
          </h2>
        );
        break;
      case 'trust':
        return (
          <h2>
            <FormattedMessage
              id="Alert.TrustTransaction"
              defaultMessage="Trust Transaction"
            />
          </h2>
        );
        break;

      case 'This is an address registered to this wallet':
        return (
          <h2>
            <FormattedMessage
              id="Alert.registeredToThis"
              defaultMessage="This is an address registered to this wallet"
            />
          </h2>
        );
        break;
      case 'Invalid Address':
        return (
          <h2>
            <FormattedMessage
              id="Alert.InvalidAddress"
              defaultMessage="Invalid Address"
            />
          </h2>
        );
        break;
      case 'Invalid Amount':
        return (
          <h2>
            <FormattedMessage
              id="Alert.InvalidAmount"
              defaultMessage="Invalid Amount"
            />
          </h2>
        );
        break;
      case 'Invalid':
        return (
          <h2>
            <FormattedMessage id="Alert.Invalid" defaultMessage="Invalid" />
          </h2>
        );
        break;
      case 'No Addresses':
        return (
          <h2>
            <FormattedMessage
              id="Alert.NoAddresses"
              defaultMessage="No Addresses"
            />
          </h2>
        );
        break;
      case 'Insufficient funds':
        return (
          <h2>
            <FormattedMessage
              id="Alert.InsufficientFunds"
              defaultMessage="Insufficient Funds"
            />
          </h2>
        );
        break;
      case 'Empty Queue!':
        return (
          <h2>
            <FormattedMessage
              id="Alert.QueueEmpty"
              defaultMessage="Queue Empty"
            />
          </h2>
        );
        break;
      case 'Invalid Transaction Fee':
        return (
          <h2>
            <FormattedMessage
              id="Alert.InvalidTransactionFee"
              defaultMessage="Invalid Transaction Fee"
            />
          </h2>
        );
        break;
      case 'No ammount set':
        return (
          <h2>
            <FormattedMessage
              id="Alert.NoAmmountSet"
              defaultMessage="No Ammount Set"
            />
          </h2>
        );
        break;
      case 'Please Fill Out Field':
        return (
          <h2>
            <FormattedMessage
              id="Alert.PleaseFillOutField"
              defaultMessage="Please Fill Out Field"
            />
          </h2>
        );
        break;
      case 'Incorrect Passsword':
        return (
          <h2>
            <FormattedMessage
              id="Alert.IncorrectPasssword"
              defaultMessage="Incorrect Passsword"
            />
          </h2>
        );
        break;
      case 'Accounts are the same':
        return (
          <h2>
            <FormattedMessage
              id="Alert.AccountsAreTheSame"
              defaultMessage="Accounts are the same"
            />
          </h2>
        );
        break;
      case 'No second account chosen':
        return (
          <h2>
            <FormattedMessage
              id="Alert.NoSecondAccountChosen"
              defaultMessage="No second account chosen"
            />
          </h2>
        );
        break;
      case 'Please wait for daemon':
        return (
          <h2>
            <FormattedMessage
              id="Alert.DaemonLoadingWait"
              defaultMessage="Loading Daemon, Please wait..."
            />
          </h2>
        );
        break;

      case 'Address Added':
        return (
          <h2>
            <FormattedMessage
              id="Alert.AddressAdded"
              defaultMessage="Address Added"
            />
          </h2>
        );
        break;

      case 'Password has been changed.':
        return (
          <h2>
            <FormattedMessage
              id="Alert.PasswordHasBeenChanged"
              defaultMessage="Password has been changed"
            />
          </h2>
        );
        break;
      case 'Wallet has been encrypted':
        return (
          <h2>
            <FormattedMessage
              id="Alert.WalletHasBeenEncrypted"
              defaultMessage="Wallet has been encrypted"
            />
          </h2>
        );
        break;
      case 'Settings saved':
        return (
          <h2>
            <FormattedMessage
              id="Alert.SettingsSaved"
              defaultMessage="Settings Saved"
            />
          </h2>
        );
        break;
      case 'Transaction Fee Set':
        return (
          <h2>
            <FormattedMessage
              id="Alert.TransactionFeeSet"
              defaultMessage="Transaction Fee Set"
            />
          </h2>
        );
        break;
      case 'Wallet Locked':
        return (
          <h2>
            <FormattedMessage
              id="Alert.WalletLocked"
              defaultMessage="Wallet Locked"
            />
          </h2>
        );
        break;
      case 'Wallet Backup':
        return (
          <h2>
            <FormattedMessage
              id="Alert.WalletBackedUp"
              defaultMessage="Wallet Backed Up"
            />
          </h2>
        );
        break;

      case 'Copied':
        return (
          <h2>
            <FormattedMessage id="Alert.Copied" defaultMessage="Copied" />
          </h2>
        );
        break;
      case 'Style Settings Saved':
        return (
          <h2>
            <FormattedMessage
              id="Alert.StyleSettingsSaved"
              defaultMessage="Style Settings Saved"
            />
          </h2>
        );
        break;

      case 'FutureDate':
        return (
          <h2>
            <FormattedMessage
              id="Alert.FutureDate"
              defaultMessage="Unlock until date/time must be at least an hour in the future"
            />
          </h2>
        );
        break;

      case 'Core Settings Saved':
        return (
          <h2>
            <FormattedMessage
              id="Alert.CoreSettingsSaved"
              defaultMessage="Core Settings Saved"
            />
          </h2>
        );
        break;
      case 'Contacts Exported':
        return (
          <h2>
            <FormattedMessage
              id="Alert.ContactsExported"
              defaultMessage="Contacts Exported"
            />
          </h2>
        );
        break;
      case 'Core Restarting':
        return (
          <h2>
            <FormattedMessage
              id="Alert.CoreRestarting"
              defaultMessage="Core Restarting"
            />
          </h2>
        );
        break;
      case 'Account cannot be named * or default':
        return (
          <h2>
            <FormattedMessage
              id="Alert.nodefaultname"
              defaultMessage="Account cannot be named * or default"
            />
          </h2>
        );
        break;
      default:
        return <h2>{this.props.modaltype}</h2>;
        break;
    }
  }
  daemonStatus() {
    if (
      this.props.settings.manualDaemon === false &&
      this.props.connections === undefined
    ) {
      return (
        <span>
          <FormattedMessage
            id="Alert.DaemonLoadingWait"
            defaultMessage="Loading Daemon, Please wait..."
          />
          ...
        </span>
      );
    } else if (
      this.props.settings.manualDaemon === true &&
      this.props.daemonAvailable === false
    ) {
      return (
        <span>
          <FormattedMessage
            id="Alert.ManualDaemonDown"
            defaultMessage="Daemon Process Not Found"
          />
        </span>
      );
    } else {
      return null;
    }
  }

  CloseBootstrapModalAndSaveSettings() {
    this.props.CloseBootstrapModal();
    let settings = GetSettings();
    settings.bootstrap = false;
    SaveSettings(settings);
  }

  BootstrapModalInteriorBuilder() {
    if (this.props.percentDownloaded === 0) {
      if (this.bootstrapModalController()) {
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

      return (
        <div>
          <h3>
            <FormattedMessage
              id="ToolTip.DbOption"
              defaultMessage="Would you like to reduce the time it takes to sync by downloading a recent version of the database?"
            />
          </h3>
          {enoughSpace === true ? null : (
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
            disabled={enoughSpace === true ? '' : 'true'}
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
              this.CloseBootstrapModalAndSaveSettings();
            }}
          >
            <FormattedMessage
              id="ToolTip.SyncFromScratch"
              defaultMessage="No, let it sync form scratch"
            />
          </button>
        </div>
      );
    } else if (this.props.percentDownloaded < 100) {
      return (
        <div>
          <h3>
            <FormattedMessage
              id="ToolTip.RecentDatabaseDownloading"
              defaultMessage="Recent Database Downloading"
            />
          </h3>
          <div className="progress-bar">
            <div
              className="filler"
              style={{ width: `${this.props.percentDownloaded}%` }}
            />
          </div>
          <h3>
            <FormattedMessage
              id="ToolTip.PleaseWait"
              defaultMessage="Please Wait..."
            />
          </h3>
        </div>
      );
    } else if (this.props.percentDownloaded === 'Connection Failure') {
      return (
        <div>
          <h3>
            <FormattedMessage
              id="ToolTip.ConnectionFailure"
              defaultMessage="Connection Failure"
            />
          </h3>

          <button
            className="button"
            disabled={enoughSpace === true ? '' : 'true'}
            onClick={() => {
              this.props.OpenBootstrapModal(true);
              configuration.bootstrapTryAgain(this);
            }}
          >
            <FormattedMessage
              id="ToolTip.TryAgain"
              defaultMessage="Try Again"
            />
          </button>
        </div>
      );
    } else {
      return (
        <div>
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
        </div>
      );
    }
  }

  // Mandatory React method
  render() {
    const { settings, connections, daemonAvailable } = this.props;

    return (
      <HeaderWrapper>
        <CustomProperties
          global
          properties={{
            '--color-1': settings.customStyling.MC1,
            '--color-2': settings.customStyling.MC2,
            '--color-3': settings.customStyling.MC3,
            '--color-4': settings.customStyling.MC4,
            '--color-5': settings.customStyling.MC5,
            '--nxs-logo': settings.customStyling.NXSlogo,
            '--icon-menu': settings.customStyling.iconMenu,
            '--footer': settings.customStyling.footer,
            '--footer-hover': settings.customStyling.footerHover,
            '--footer-active': settings.customStyling.footerActive,
            '--background-main-image': `url('${settings.wallpaper}')`,
            '--panel-background-color': settings.customStyling.pannelBack,
            '--maxMind-copyright': settings.customStyling.maxMindCopyright,
          }}
        />

        <NotificationModal {...this.props} />
        <ErrorModal {...this.props} />
        <BootstrapModal {...this.props} />

        <LogoLink to="/">
          <Logo icon={logoFull} />
          <Beta>BETA</Beta>
        </LogoLink>

        <UnderHeader>
          <HorizontalLine />
          <DaemonStatus {...this.props} />
        </UnderHeader>

        {!!connections && !!daemonAvailable && (
          <StatusIcons>
            <SyncStatus {...this.props} />
            <SignInStatus {...this.props} />
            {/* wrap this in a check too... */}
            <StakingStatus {...this.props} />
          </StatusIcons>
        )}
      </HeaderWrapper>
    );
  }
}

// Mandatory React-Redux method
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
