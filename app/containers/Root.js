import React from "react";
// import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import { Route } from "react-router";
// import { FormattedMessage, IntlProvider } from "react-intl-redux";
import App from "./App";
import Loader from "../components/Loader/index";
import Overview from "../components/Overview/index";
import Header from "../components/Header/index";
import Footer from "../components/Footer/index";
import SendRecieve from "../components/SendRecieve/index";
import Transactions from "../components/Transactions/index";
import Market from "../components/Market/index";
import Addressbook from "../components/Addressbook/index";
import BlockExplorer from "../components/BlockExplorer/index";
import Settings from "../components/Settings/index";
import Terminal from "../components/Terminal/index";
import StyleGuide from "../components/StyleGuide/index";
import List from "../components/List/index";
import About from "../components/About/index";
import Exchange from "../components/Exchange/index";
import settings from "../../app/api/settings";
import messages from "./messages";
import locale from "../reducers/intl";
import enLocaleData from "react-intl/locale-data/en";
import { addLocaleData } from "react-intl";
import { updateIntl } from "react-intl-redux";
import localesReducer from "../reducers/intl";
import { connect, Provider } from "react-redux";
import IntlWrapper from "../containers/intlWrapper";
export default function Root({ store, history }) {
  // let configSettings = settings.GetSettings();

  // if (configSettings.wallpaper) {
  //   let customBGImageUrl = configSettings.wallpaper;
  //   if ( process.platform === "win32")
  //       {
  //         customBGImageUrl =  customBGImageUrl.replace(/\\/g, '/');
  //       }
  //   console.log("Applying custom wallpaper: " + customBGImageUrl);
  //   document.body.style.setProperty(
  //     "--background-main-image",
  //     "url('" + customBGImageUrl + "')"
  //   );
  // }

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App>
          <div id="app-header">
            <Route path="/" component={Header} />
          </div>
          <div id="app-content">
            <div id="app-content-container">
              <div id="app-loader">
                <Loader />
              </div>
              <Route exact path="/" component={Overview} />
              <Route exact path="/SendRecieve" component={SendRecieve} />
              <Route exact path="/Transactions" component={Transactions} />
              <Route exact path="/Market" component={Market} />
              <Route exact path="/Addressbook" component={Addressbook} />
              <Route exact path="/BlockExplorer" component={BlockExplorer} />
              <Route path="/Settings" component={Settings} />
              <Route path="/Terminal" component={Terminal} />
              <Route exact path="/StyleGuide" component={StyleGuide} />
              <Route path="/Exchange" component={Exchange} />
              <Route exact path="/List" component={List} />
              <Route exact path="/About" component={About} />
            </div>
          </div>

          <div id="app-navigation">
            <Route path="/" component={Footer} />
          </div>
        </App>
      </ConnectedRouter>
    </Provider>
  );
}
