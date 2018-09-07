import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import electron from "electron";
import MenuBuilder from "../../menu";
import Modal from "react-responsive-modal";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/headerActionCreators";

import lockedImg from "images/lock-encrypted.svg";
import unencryptedImg from "images/lock-unencrypted.svg";
import unlockImg from "images/lock-minting.svg";
import statGood from "images/status-good.svg";
import statBad from "images/status-bad.svg";
import stakeImg from "images/staking.svg";
import logoFull from "images/logo-full-beta.svg";

import GOOGLE from "../../script/googleanalytics";

var checkportinterval;

const mapStateToProps = state => {
  return { ...state.overview, ...state.common };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Header extends Component {
  componentDidMount() {
    const menuBuilder = new MenuBuilder(electron.remote.getCurrentWindow().id);
    var self = this;
    this.props.SetGoogleAnalytics(GOOGLE);
    let encryptionStatus = false;
    if (this.props.unlocked_until !== undefined) {
      encryptionStatus = true;
    }

    this.props.LoadAddressBook();

    menuBuilder.buildMenu(self);

    this.props.GetInfoDump();

    self.set = setInterval(function() {
      self.props.GetInfoDump();
    }, 20000);

    checkportinterval = setInterval(function()
    {
      self.checkIfPortOpen();
    }, 10000);

    this.props.history.push("/");
  }

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

    if (nextProps.blocks !== this.props.blocks) {
      RPC.PROMISE("getpeerinfo", [])
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
      RPC.PROMISE("listtransactions").then(payload => {
        let MRT = payload.reduce((a, b) => {
          if (a.time > b.time) {
            return a;
          } else {
            return b;
          }
        });

        if (MRT.category === "receive") {
          this.props.OpenModal("receive");
        } else if (MRT.category === "send") {
          this.props.OpenModal("send");
        }
      });
    } else {
      return null;
    }
  }

  checkIfPortOpen()
  {
    const isPortAvailable = require('is-port-available');
 
    var port = 9336;
    isPortAvailable(port).then( status =>{
        if(status)
        {
          this.props.SetPortIsAvailable(true);
        } 
        else{
          this.props.SetPortIsAvailable(false);
            console.log('Port ' + port + ' IS NOT available!');
            console.log('Reason : ' + isPortAvailable.lastError);
        }
    });
  }

  signInStatus() {
    if (this.props.unlocked_until === undefined) {
      return unencryptedImg;
    } else if (this.props.unlocked_until === 0) {
      return lockedImg;
    } else if (this.props.unlocked_until >= 0) {
      return unlockImg;
    }
  }

  signInStatusMessage() {
    let unlockDate = new Date(this.props.unlocked_until * 1000).toLocaleString(
      "en",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );

    if (this.props.unlocked_until === undefined) {
      return "Wallet Unencrypted";
    } else if (this.props.unlocked_until === 0) {
      return "Wallet Locked";
    } else if (this.props.unlocked_until >= 0) {
      if (this.props.minting_only) {
        return "Unlocked until: " + unlockDate + " STAKING ONLY";
      } else {
        return "Unlocked until: " + unlockDate;
      }
    }
  }

  syncStatus() {
    if (this.props.heighestPeerBlock > this.props.blocks) {
      return statBad;
    } else {
      return statGood;
    }
  }

  returnSyncStatusTooltip() {
    if (this.props.heighestPeerBlock > this.props.blocks) {
      return (
        "Syncing...\nBehind\n" +
        (this.props.heighestPeerBlock - this.props.blocks).toString() +
        "\nBlocks"
      );
    } else {
      return "Synced";
    }
  }
  modalinternal() {
    switch (this.props.modaltype) {
      case "receive":
        return <h2>Transaction Received</h2>;
        break;
      case "send":
        return <h2>Transaction Sent</h2>;
        break;
      case "This is an address regiestered to this wallet":
        return <h2>This is an address regiestered to this wallet</h2>;
        break;
      case "Invalid Address":
        return <h2>Invalid Address</h2>;
        break;
      case "Address Added":
        return <h2>Address Added</h2>;
        break;
      case "No Addresses":
        return <h2>No Addresses</h2>;
        break;
      case "Empty Queue!":
        return <h2>Queue Empty</h2>;
        break;
      case "Password has been changed.":
        return <h2>Password has been changed.</h2>;
        break;
      case "Wallet has been encrypted":
        return <h2>Wallet has been encrypted</h2>;
        break;
      case "Settings saved":
        return <h2>Settings saved</h2>;
        break;
      case "Transaction Fee Set":
        return <h2>Transaction Fee Set</h2>;
        break;
      case "Wallet Locked":
        return <h2>Wallet Locked</h2>;
        break;
      case "Copied":
        return <h2>Copied</h2>;
        break;
      default:
        "";
        break;
    }
  }

  returnIfPortAvailable()
  {
    if (this.props.portAvailable == false)
    {
      return <div className="noDeamonPort"> DAEMON NOT AVAILABLE </div>
    }
    else
    {
      return null;
    }
  }

  render() {
    return (
      <div id="Header">
        <Modal
          showCloseIcon={false}
          center={true}
          open={this.props.open}
          onClose={this.props.CloseModal}
          classNames={{ overlay: "custom-overlay", modal: "custom-modal" }}
        >
          {this.modalinternal()}
        </Modal>
        {this.returnIfPortAvailable()}
        <div id="settings-menu" className="animated rotateInDownRight ">
          <div className="icon">
            <img src={this.signInStatus()} />
            <div className="tooltip bottom">
              <div>{this.signInStatusMessage()}</div>
            </div>
          </div>
          <div className="icon">
            <img src={stakeImg} />
            <div className="tooltip bottom">
              <div>Stake Weight: {this.props.stakeweight}%</div>
              <div>Interest Rate: {this.props.interestweight}%</div>
              <div>Trust Weight: {this.props.trustweight}%</div>
              <div>Block Weight: {this.props.blockweight}</div>
            </div>
          </div>
          <div className="icon">
            <img src={this.syncStatus()} />
            <div className="tooltip bottom" style={{ right: "100%" }}>
              <div>{this.returnSyncStatusTooltip()}</div>
            </div>
          </div>
        </div>
        <Link to="/">
          <img
            id="logo"
            className="animated zoomIn "
            src={logoFull}
            alt="Nexus Logo"
          />
        </Link>

        <div id="hdr-line" className="animated fadeIn " />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
