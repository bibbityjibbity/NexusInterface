// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import * as TYPE from 'actions/actiontypes';
import UIContext from 'context/ui';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.market,
  };
};
const mapDispatchToProps = dispatch => ({
  setTradeVol: TV => dispatch({ type: TYPE.SET_TRADEVOL, payload: TV }),
  setThershold: TH => dispatch({ type: TYPE.SET_THRESHOLD, payload: TH }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
});

class SettingsMarket extends Component {
  static contextType = UIContext;

  // Class methods
  feedback() {
    this.context.showNotification(
      <FormattedMessage
        id="Alert.SettingsSaved"
        defaultMessage="Settings Saved"
      />,
      'success'
    );
  }
  // Mandatory React method
  render() {
    return (
      <div id="SettingsMarket">
        {' '}
        <form>
          <fieldset>
            <legend>Arbitrage Alert Settings</legend>

            <div className="field">
              <label>Trade Volume:</label>
              <input
                type="number"
                // placeholder="500 NXS"
                onChange={e =>
                  this.props.setTradeVol(parseFloat(e.target.value))
                }
                value={this.props.tradeVolume}
              />
              <span className="hint">
                Volume of NXS you would like to calculate arbitrage for
              </span>
            </div>

            <div className="field">
              <label>BTC Profit Threshold:</label>
              <input
                type="number"
                // placeholder="0.000251 BTC"
                value={this.props.threshold}
                onChange={e =>
                  this.props.setThershold(parseFloat(e.target.value))
                }
              />
              <span className="hint">
                Threshold of profit to trigger an arbitrage alert
              </span>
            </div>
            <button onClick={() => this.feedback()} className="button primary">
              Submit
            </button>
          </fieldset>
        </form>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsMarket);
