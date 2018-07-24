import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import styles from "./style.css";

export default class Footer extends Component {
  render() {
    return (
      <div id="Footer">
        <div id="ftr-line" />
        <div id="navigation">
          <NavLink exact to="/">
            <img src="images/icon-home.png" alt="Overview" />
            <div className="tooltip top">Overview</div>
          </NavLink>
          <NavLink to="/SendRecieve">
            <img src="images/icon-send.png" alt="SendRecieve" />
            <div className="tooltip top">Send/Recieve</div>
          </NavLink>
          <NavLink to="/Transactions">
            <img src="images/icon-transactions.png" alt="Transactions" />
            <div className="tooltip top">Transactions</div>
          </NavLink>
          <NavLink to="/Market">
            <img src="images/icon-market.png" alt="Market Data" />
            <div className="tooltip top">Market&nbsp;Data</div>
          </NavLink>
          <NavLink to="/Addressbook">
            <img src="images/icon-contacts.png" alt="Address Book" />
            <div className="tooltip top">Address&nbsp;Book</div>
          </NavLink>
          <NavLink to="/BlockExplorer">
            <img src="images/icon-explorer.png" alt="Block Explorer" />
            <div className="tooltip top">Block&nbsp;Explorer</div>
          </NavLink>
          <NavLink to="/Settings">
            <img src="images/icon-settings.png" alt="Settings" />
            <div className="tooltip top">Settings</div>
          </NavLink>
          <NavLink to="/Terminal">
            <img src="images/icon-console.png" alt="Console" />
            <div className="tooltip top">Console</div>
          </NavLink>
          <NavLink to="/StyleGuide">
            <img src="images/icon-developer.png" alt="Style Guide" />
            <div className="tooltip top">Style&nbsp;Guide</div>
          </NavLink>
          <NavLink to="/List">
            <img src="images/icon-trustlist.png" alt="Trust List" />
            <div className="tooltip top">Trust&nbsp;List</div>
          </NavLink>
        </div>
      </div>
    );
  }
}
