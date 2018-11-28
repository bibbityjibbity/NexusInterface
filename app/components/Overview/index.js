/*
  Title: Overview
  Description: the landing page for the application.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import Modal from "react-responsive-modal";
import * as TYPE from "../../actions/actiontypes";
import { NavLink } from "react-router-dom";
import { remote } from "electron";
import Request from "request";
import { FormattedMessage } from "react-intl";
import fs from "fs";
import path from "path";

// Internal Dependencies
import { GetSettings, SaveSettings } from "../../api/settings.js";
import NetworkGlobe from "./NetworkGlobe";
import ContextMenuBuilder from "../../contextmenu";
import * as helpers from "../../script/helper.js";
import configuration from "../../api/configuration";

// Images
import USD from "../../images/USD.svg";
import transactionsArrows from "../../images/transactions-arrows.svg";
import marketicon from "../../images/marketstats-white.svg";
import supplyicon from "../../images/supply.svg";
import hours24icon from "../../images/24hr.svg";
import nxsStake from "../../images/nxs-staking.svg";
import interestRate from "../../images/nxs-chart.png";
import messages from "../../Language/messages";
import Connections0 from "../../images/Connections0.svg";
import Connections4 from "../../images/Connections4.svg";
import Connections8 from "../../images/Connections8.svg";
import Connections12 from "../../images/Connections12.svg";
import Connections14 from "../../images/Connections14.svg";
import Connections16 from "../../images/Connections16.svg";
import blockweight0 from "../../images/BlockWeight-0.svg";
import blockweight1 from "../../images/BlockWeight-1.svg";
import blockweight2 from "../../images/BlockWeight-2.svg";
import blockweight3 from "../../images/BlockWeight-3.svg";
import blockweight4 from "../../images/BlockWeight-4.svg";
import blockweight5 from "../../images/BlockWeight-5.svg";
import blockweight6 from "../../images/BlockWeight-6.svg";
import blockweight7 from "../../images/BlockWeight-7.svg";
import blockweight8 from "../../images/BlockWeight-8.svg";
import blockweight9 from "../../images/BlockWeight-9.svg";
import trust00 from "../../images/trust00.svg";
import trust10 from "../../images/trust00.svg";
import trust20 from "../../images/trust00.svg";
import trust30 from "../../images/trust00.svg";
import trust40 from "../../images/trust00.svg";
import trust50 from "../../images/trust00.svg";
import trust60 from "../../images/trust00.svg";
import trust70 from "../../images/trust00.svg";
import trust80 from "../../images/trust00.svg";
import trust90 from "../../images/trust00.svg";
import trust100 from "../../images/trust00.svg";
import { intlReducer } from "react-intl-redux";
import nxsblocks from "../../images/blockexplorer-invert-white.svg";
import interesticon from "../../images/interest.svg";
import stakeicon from "../../images/staking-white.svg";
import maxmindLogo from "../../images/maxmind-header-logo-compact.svg";

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings,
    ...state.intl
  };
};
const mapDispatchToProps = dispatch => ({
  setExperimentalWarning: save =>
    dispatch({ type: TYPE.SET_EXPERIMENTAL_WARNING, payload: save }),
  BlockDate: stamp => dispatch({ type: TYPE.BLOCK_DATE, payload: stamp }),
  acceptMITAgreement: () => dispatch({ type: TYPE.ACCEPT_MIT }),
  toggleSave: () => dispatch({ type: TYPE.TOGGLE_SAVE_SETTINGS_FLAG }),
  ignoreEncryptionWarning: () =>
    dispatch({ type: TYPE.IGNORE_ENCRYPTION_WARNING }),
  setWebGLEnabled: isEnabled =>
    dispatch({ type: TYPE.SET_WEBGL_ENABLED, payload: isEnabled })
});

class Overview extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    let WEBGL = require("../../script/WebGLCheck.js");
    if (WEBGL.isWebGLAvailable()) {
      this.props.setWebGLEnabled(true);
    } else {
      this.props.setWebGLEnabled(true);
      var warning = WEBGL.getWebGLErrorMessage();
      console.error(warning);
    }
    window.addEventListener("contextmenu", this.setupcontextmenu, false);

    if (this.props.googleanalytics != null) {
      this.props.googleanalytics.SendScreen("Overview");
    }
  }
  reDrawEverything() {}
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }
  // React Method (Life cycle hook)
  componentDidUpdate(previousprops) {
    if (this.props.blocks > previousprops.blocks) {
      let newDate = new Date();
      this.props.BlockDate(newDate);
    }

    if (this.props.saveSettingsFlag) {
      require("../../api/settings.js").SaveSettings(this.props.settings);
    }

    if (this.props.webGLEnabled == false) {
      return;
    }

    if (this.props.blocks != previousprops.blocks) {
      if (this.props.blocks != 0 && previousprops.blocks != 0) {
        this.redrawCurves();
      }
    }

    if (this.props.saveSettingsFlag) {
      require("../../api/settings.js").SaveSettings(this.props.settings);
    }

    if (
      this.props.settings.acceptedagreement !== false ||
      this.props.settings.renderGlobe !== false ||
      this.props.webGLEnabled !== false
    ) {
      if (
        (previousprops.connections == undefined ||
          previousprops.connections == 0) &&
        this.props.connections != 0 &&
        this.props.webGLEnabled !== false &&
        this.props.settings.renderGlobe === true
      ) {
        //Daemon Starting Up
        this.reDrawEverything();
      }
    }
    if (this.props.connections != previousprops.connections) {
      if (this.props.connections != 0 && previousprops.connections != 0) {
        this.removeOldPoints();
      }
    }
  }

  // Class methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;

    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  closeLicenseModal() {
    this.props.acceptMITAgreement();
  }

  BlockRapper() {
    if (this.props.blockDate === "Getting Next Block...") {
      return (
        <FormattedMessage
          id="ToolTip.GettingNextBlock"
          defaultMessage="Getting Next Block..."
        />
      );
    } else {
      return this.props.blockDate.toLocaleString(this.props.settings.locale);
    }
  }

  returnLicenseModalInternal() {
    let tempYear = new Date();

    return (
      <div>
        The MIT License (MIT)
        <br />
        Copyright {tempYear.getFullYear()} Nexus
        <br />
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files (the
        "Software"), to deal in the Software without restriction, including
        without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to
        permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
        <br />
        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.
        <br />
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        <br />
        <button
          key="agreement-button-accept"
          className="button primary"
          onClick={() => this.closeLicenseModal()}
        >
          ACCEPT
        </button>
      </div>
    );
  }

  returnExperimentalModalInternal() {
    return (
      <div>
        <h4>
          THIS SOFTWARE IS EXPERIMENTAL AND IN BETA TESTING. BY DEFAULT IT WILL
          NOT USE ANY EXISTING NEXUS WALLET NOR ADDRESSES THAT YOU MAY ALREADY
          HAVE.
          <br />
          <br />
          AS SUCH, THIS WALLET SHOULD{" "}
          <b>
            <u>NOT </u>
          </b>
          BE USED AS YOUR PRIMARY WALLET AND DOING SO MAY AFFECT YOUR ABILITY TO
          ACCESS YOUR COINS UP TO AND INCLUDING LOSING THEM PERMANENTLY.
          <br />
          <br />
          USE THIS SOFTWARE AT YOUR OWN RISK.
        </h4>
        <br key="br2" />
        <button
          key="experiment-button-accept"
          className="button"
          onClick={() => this.props.setExperimentalWarning(false)}
        >
          OK
        </button>
        <button
          key="experiment-button-noshow"
          className="button"
          onClick={() => this.props.setExperimentalWarning(true)}
        >
          Don't show this again
        </button>
      </div>
    );
  }

  connectionsImage() {
    const con = this.props.connections;

    if (con <= 4) {
      return Connections0;
    } else if (con > 4 && con <= 6) {
      return Connections4;
    } else if (con > 6 && con <= 12) {
      return Connections8;
    } else if (con > 12 && con <= 14) {
      return Connections12;
    } else if (con > 14 && con <= 15) {
      return Connections14;
    } else if (con > 15) {
      return Connections16;
    } else {
      return Connections0;
    }
  }

  trustImg() {
    const TW = parseInt(this.props.trustweight / 10);
    switch (TW) {
      case 0:
        return trust00;
        break;
      case 1:
        return trust10;
        break;
      case 2:
        return trust20;
        break;
      case 3:
        return trust30;
        break;
      case 4:
        return trust40;
        break;
      case 5:
        return trust50;
        break;
      case 6:
        return trust60;
        break;
      case 7:
        return trust70;
        break;
      case 8:
        return trust80;
        break;
      case 9:
        return trust90;
        break;
      case 10:
        return trust100;
        break;
      default:
        return trust00;
        break;
    }
  }

  blockWeightImage() {
    const BW = parseInt(this.props.blockweight / 10);
    switch (BW) {
      case 0:
        return blockweight0;
        break;
      case 1:
        return blockweight1;
        break;
      case 2:
        return blockweight2;
        break;
      case 3:
        return blockweight3;
        break;
      case 4:
        return blockweight4;
        break;
      case 5:
        return blockweight5;
        break;
      case 6:
        return blockweight6;
        break;
      case 7:
        return blockweight7;
        break;
      case 8:
        return blockweight8;
        break;
      case 9:
        return blockweight9;
        break;
      default:
        return blockweight0;
        break;
    }
  }

  returnIfDrawLines() {
    //if (testinglines == true)
  }

  returnIfGlobeEnabled() {
    if (
      this.props.settings.acceptedagreement == false ||
      this.props.settings.renderGlobe == false ||
      this.props.webGLEnabled == false
    ) {
      return null;
    } else {
      return [
        [
          <NetworkGlobe
            handleOnLineRender={e => (this.redrawCurves = e)}
            handleOnRemoveOldPoints={e => (this.removeOldPoints = e)}
            handleOnAddData={e => (this.reDrawEverything = e)}
            pillarColor={this.props.settings.customStyling.globePillarColorRGB}
            archColor={this.props.settings.customStyling.globeArchColorRGB}
            globeColor={this.props.settings.customStyling.globeMultiColorRGB}
          />
        ],
        [
          <div className="maxmindCopyright">
            <img
              id="maxmindCopyLogo"
              src={maxmindLogo}
              width="100px"
              height="100px"
            />
            Globe includes GeoLite2
          </div>
        ]
      ];
    }
  }

  numberWithCommas(x) {
    if (x) return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  calculateUSDvalue() {
    if (this.props.rawNXSvalues[0]) {
      let selectedCurrancyValue = this.props.rawNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });

      let currencyValue = this.props.balance * selectedCurrancyValue[0].price;
      if (currencyValue === 0) {
        currencyValue = `${currencyValue}.00`;
      } else {
        currencyValue = currencyValue.toFixed(2);
      }
      return `${helpers.ReturnCurrencySymbol(
        selectedCurrancyValue[0].name,
        this.props.displayNXSvalues
      ) + currencyValue}`;
    } else {
      return "$0";
    }
  }

  marketPriceFormatter() {
    if (this.props.displayNXSvalues[0]) {
      let selectedCurrancyValue = this.props.displayNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      return selectedCurrancyValue[0].price;
    } else {
      return "$0";
    }
  }

  marketCapFormatter() {
    if (this.props.displayNXSvalues[0]) {
      let selectedCurrancyValue = this.props.displayNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      return selectedCurrancyValue[0].marketCap;
    } else {
      return "$0";
    }
  }

  pctChange24hrFormatter() {
    if (this.props.displayNXSvalues[0]) {
      let selectedCurrancyValue = this.props.displayNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      return selectedCurrancyValue[0].changePct24Hr;
    } else {
      return "0";
    }
  }

  // Mandatory React method
  render() {
    return (
      <div id="overviewPage">
        <Modal
          key="agreement-modal"
          open={!this.props.settings.acceptedagreement}
          onClose={() => true}
          focusTrapped={true}
          center
          showCloseIcon={false}
          classNames={{ modal: "modal" }}
        >
          <div>
            <h2>
              {" "}
              <FormattedMessage
                id="overview.LicensceAgreement"
                defaultMessage="License Agreement"
              />
            </h2>
            {this.returnLicenseModalInternal()}
          </div>
        </Modal>
        <Modal
          key="experiment-modal"
          focusTrapped={true}
          open={
            this.props.settings.acceptedagreement &&
            (this.props.settings.experimentalWarning &&
              this.props.experimentalOpen)
          }
          onClose={() => this.props.setExperimentalWarning(false)}
          center
          classNames={{ modal: "modal" }}
        >
          {this.returnExperimentalModalInternal()}
        </Modal>
        <Modal
          key="encrypted-modal"
          open={
            !this.props.connections &&
            !this.props.experimentalOpen &&
            this.props.settings.acceptedagreement &&
            (!this.props.encrypted && !this.props.ignoreEncryptionWarningFlag)
          }
          onClose={() => this.props.ignoreEncryptionWarning()}
          center
          classNames={{ modal: "modal" }}
        >
          <h3>
            {" "}
            <FormattedMessage
              id="overview.EncryptedModal"
              defaultMessage="Your Wallet Is Not Encrypted!"
            />
          </h3>
          <p>
            <FormattedMessage
              id="overview.Suggestion"
              defaultMessage="You really should encrypt your wallet to keep your Nexus safe."
            />
          </p>
          <NavLink to="/Settings/Unencrypted">
            <button className="button primary">
              <FormattedMessage
                id="overview.TakeMeThere"
                defaultMessage="Take Me There"
              />
            </button>
          </NavLink>
          <button
            className="button negative"
            onClick={() => this.props.ignoreEncryptionWarning()}
          >
            <FormattedMessage id="overview.Ignore" defaultMessage="Ignore" />{" "}
          </button>
        </Modal>
        <div className="left-stats">
          {this.props.connections === undefined ? null : (
            <div className="left-top-stats">
              {this.props.stake > 0 ? (
                <div
                  id="nxs-balance-info"
                  className="animated fadeInDown delay-1s"
                >
                  <div className="h2">
                    Balance and Stake <span className="h2-nospace">(NXS)</span>
                  </div>
                  <img src={nxsStake} />
                  <div className="overviewValue">
                    {this.props.balance + this.props.stake}
                  </div>
                </div>
              ) : (
                <div
                  id="nxs-balance-info"
                  className="animated fadeInDown delay-1s"
                >
                  <div className="h2">
                    <FormattedMessage
                      id="overview.Balance"
                      defaultMessage="Balance"
                    />
                    <span className="h2-nospace">(NXS)</span>
                  </div>
                  <img src={nxsStake} />
                  <div className="overviewValue">{this.props.balance}</div>
                </div>
              )}

              <div
                id="nxs-currency-value-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.Balance"
                    defaultMessage="Balance"
                  />{" "}
                  <span className="h2-nospace">
                    ({this.props.settings.fiatCurrency})
                  </span>
                </div>
                <img src={USD} />
                <div className="overviewValue">{this.calculateUSDvalue()}</div>
              </div>
              <div
                id="nxs-transactions-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.Transactions"
                    defaultMessage="Transactions"
                  />
                </div>
                <img src={transactionsArrows} />
                <div className="overviewValue">{this.props.txtotal}</div>
              </div>
            </div>
          )}

          {this.props.displayNXSvalues[0] === undefined ? null : (
            <div className="left-bottom-stats">
              <div
                id="nxs-market-price-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.MarketPrice"
                    defaultMessage="Market Price"
                  />
                  <span className="h2-nospace">
                    ({this.props.settings.fiatCurrency})
                  </span>
                </div>
                <img src={marketicon} />
                <div className="overviewValue">
                  {this.marketPriceFormatter()}
                </div>
              </div>

              <div
                id="nxs-market-price-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.MarketCap"
                    defaultMessage="Market Cap"
                  />{" "}
                  <span className="h2-nospace">
                    ({this.props.settings.fiatCurrency})
                  </span>
                </div>
                <img src={supplyicon} />
                <div className="overviewValue">{this.marketCapFormatter()}</div>
              </div>

              <div
                id="nxs-market-price-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.24hrChange"
                    defaultMessage="24hr Change"
                  />{" "}
                  <span className="h2-nospace">
                    ({this.props.settings.fiatCurrency} %)
                  </span>
                </div>
                <img src={hours24icon} />
                <div className="overviewValue">
                  {this.pctChange24hrFormatter()}%
                </div>
              </div>
            </div>
          )}
        </div>
        {this.returnIfGlobeEnabled()}{" "}
        <div className="right-stats">
          {" "}
          {this.props.connections === undefined ? null : (
            <div>
              <div
                id="nxs-connections-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.Connections"
                    defaultMessage="Connections"
                  />
                </div>
                <img
                  id="nxs-getinfo-connections-image"
                  src={this.connectionsImage()}
                />
                <div className="overviewValue">{this.props.connections}</div>
              </div>
              <div
                id="nxs-interestweight-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.InterestRate"
                    defaultMessage="Interest Rate"
                  />
                </div>
                <img src={interesticon} />
                <div className="overviewValue">
                  {this.props.interestweight + "%"}
                </div>
              </div>
              <div
                id="nxs-blocks-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.BlockCount"
                    defaultMessage="Block Count"
                  />
                </div>
                <img src={nxsblocks} />

                <div className="overviewValue">
                  {this.numberWithCommas(this.props.blocks)}
                </div>
                <span className="tooltip left" style={{ whiteSpace: "nowrap" }}>
                  {this.BlockRapper()}
                </span>
              </div>
              <div
                id="nxs-blockweight-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.BlockWeightt"
                    defaultMessage="Block Weight"
                  />
                </div>
                <img
                  src={this.blockWeightImage()}
                  id="nxs-getinfo-blockweight-image"
                />
                <div className="overviewValue">{this.props.blockweight}</div>
              </div>

              <div
                id="nxs-trustweight-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.TrustWeight"
                    defaultMessage="Trust Weight"
                  />
                </div>
                <img id="nxs-getinfo-trustweight-image" src={this.trustImg()} />
                <div className="overviewValue">{this.props.trustweight}</div>
              </div>

              <div
                id="nxs-stakeweight-info"
                className="animated fadeInDown delay-1s"
              >
                <div className="h2">
                  <FormattedMessage
                    id="overview.StakeWeight"
                    defaultMessage="Stake Weight"
                  />
                </div>
                <img src={stakeicon} />
                <div className="overviewValue">{this.props.stakeweight}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
