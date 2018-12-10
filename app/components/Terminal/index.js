/*
  Title: 
  Description: 
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { remote } from 'electron';
import { Route, Redirect } from 'react-router';

// Internal Global Dependencies
import ContextMenuBuilder from 'contextmenu';
import Icon from 'components/common/Icon';

// Internal Local Dependencies
import TerminalConsole from './TerminalConsole';
import TerminalCore from './TerminalCore';
import styles from './style.css';

// Images
import consoleIcon from 'images/console.sprite.svg';
import logoIcon from 'images/logo.sprite.svg';
import coreIcon from 'images/core.sprite.svg';
import { FormattedMessage } from 'react-intl';

export default class Terminal extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class Methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  // Mandatory React method
  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Terminal = /Terminal)
    if (this.props.location.pathname === this.props.match.url) {
      console.log('Redirecting to Terminal Console');

      return <Redirect to={`${this.props.match.url}/Console`} />;
    }

    return (
      <div id="terminal" className="animated fadeIn">
        <h2>
          <Icon icon={consoleIcon} className="hdr-img" />
          <FormattedMessage id="Console.Console" defaultMessage="Console" />
        </h2>

        <div className="panel">
          <ul className="tabs">
            <li>
              <NavLink to={`${this.props.match.url}/Console`}>
                <Icon icon={logoIcon} />
                <FormattedMessage
                  id="Console.Console"
                  defaultMessage="Console"
                />
              </NavLink>
            </li>
            <li>
              <NavLink to={`${this.props.match.url}/Core`}>
                <Icon icon={coreIcon} />
                <FormattedMessage
                  id="Console.CoreOutput"
                  defaultMessage="Console"
                />
              </NavLink>
            </li>
          </ul>

          <div id="terminal-content">
            <Route
              exact
              path={`${this.props.match.path}/`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Console`}
              component={TerminalConsole}
            />
            <Route
              path={`${this.props.match.path}/Core`}
              component={TerminalCore}
            />
          </div>
        </div>
      </div>
    );
  }
}
