import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import { FormattedMessage } from "react-intl";
import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

import trustimg from "../../images/trust-list.svg";

const mapStateToProps = state => {
  return { ...state.list, ...state.common };
};

const mapDispatchToProps = dispatch => ({
  GetListDump: returnedData =>
    dispatch({ type: TYPE.GET_TRUST_LIST, payload: returnedData }),
  ToggleSortDir: () => dispatch({ type: TYPE.TOGGLE_SORT_DIRECTION })
});

class List extends Component {
  componentDidMount() {
    RPC.PROMISE("getnetworktrustkeys", []).then(payload => {
      this.props.GetListDump(payload.keys);
    });
    this.props.googleanalytics.SendScreen("TrustList");
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  buildList() {
    if (this.props.trustlist) {
      let sortableList = [...this.props.trustlist];

      if (this.props.acc) {
        sortableList = sortableList.sort(
          (a, b) => b["interest rate"] - a["interest rate"]
        );
      } else {
        sortableList = sortableList.sort(
          (a, b) => a["interest rate"] - b["interest rate"]
        );
      }

      return sortableList.map(ele => (
        <tr key={ele.address.slice(0, 8)}>
          <td key={ele.address.slice(0, 9)}>{ele.address}</td>

          <td key={ele.address.slice(0, 10)}>{ele["interest rate"]}</td>
        </tr>
      ));
    }
  }

  render() {
    return (
      <div id="trustlist" className="animated fadeIn">
        <h2>
          <img src={trustimg} className="hdr-img" />
          <FormattedMessage
            id="TrustList.TrustList"
            defaultMessage="Trust List"
          />
        </h2>

        <div className="panel">
          {this.props.isInSync === false ? (
            <h2>
              <FormattedMessage
                id="TrustList.SyncMsg"
                defaultMessage="Please let your wallet sync with the network"
              />
            </h2>
          ) : (
            <div id="table-wrap">
              <table>
                <thead>
                  <th>
                    <div>
                      <FormattedMessage
                        id="TrustList.Address"
                        defaultMessage="Address"
                      />
                    </div>
                  </th>

                  <th onClick={() => this.props.ToggleSortDir()}>
                    <div>
                      {" "}
                      <FormattedMessage
                        id="TrustList.InterestRate"
                        defaultMessage="Interest Rate"
                      />
                    </div>
                  </th>
                </thead>

                <tbody>{this.buildList()}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
