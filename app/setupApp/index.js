// External
import { remote } from 'electron';
import fs from 'fs';
import path from 'path';

// Internal
import UIController from 'components/UIController';
import WEBGL from 'scripts/WebGLCheck.js';
import * as ac from 'actions/setupAppActionCreators';
import { getInfo } from 'actions/coreActionCreators';
import { loadSettingsFromFile } from 'actions/settingsActionCreators';
import { loadThemeFromFile } from 'actions/themeActionCreators';
import { loadAddressBookFromFile } from 'actions/addressBookActionCreators';
import { loadModules } from 'actions/moduleActionCreators';
import updater from 'updater';
import appMenu from 'appMenu';
import configuration from 'api/configuration';
import { Tail } from 'utils/tail';
import normalizePath from 'utils/normalizePath';
import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';
import ClosingModal from './ClosingModal';

window.remote = remote;

var tail;
var debugFileLocation;
var checkIfFileExistsInterval;
var printCoreOutputTimer;

export default function setupApp(store, history) {
  const { dispatch } = store;
  store.dispatch(loadSettingsFromFile());
  store.dispatch(loadThemeFromFile());

  appMenu.initialize(store, history);
  appMenu.build();

  dispatch(loadAddressBookFromFile());

  dispatch(getInfo());
  setInterval(() => dispatch(getInfo()), 10000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  checkWebGL(dispatch);

  const mainWindow = remote.getCurrentWindow();

  mainWindow.on('close', async e => {
    const {
      settings: { minimizeOnClose, manualDaemon },
    } = store.getState();

    // forceQuit is set when user clicks Quit option in the Tray context menu
    if (minimizeOnClose && !remote.getGlobal('forceQuit')) {
      mainWindow.hide();
      if (process.platform === 'darwin') {
        remote.app.dock.hide();
      }
    } else {
      if (tail != undefined) {
        tail.unwatch();
      }
      clearInterval(printCoreOutputTimer);
      clearInterval(checkIfFileExistsInterval);
      UIController.openModal(ClosingModal);

      if (manualDaemon) {
        remote.app.exit();
      } else {
        await remote.getGlobal('core').stop();
        remote.app.exit();
      }
    }
  });

  startCoreOuputeWatch(store);
  const state = store.getState();

  updater.setup();
  if (state.settings.autoUpdate) {
    updater.autoUpdate();
  }

  showInitialModals(state);

  dispatch(loadModules());
}

function checkWebGL(dispatch) {
  if (WEBGL.isWebGLAvailable()) {
    dispatch(ac.setWebGLEnabled(true));
  } else {
    dispatch(ac.setWebGLEnabled(false));
    console.error(WEBGL.getWebGLErrorMessage());
  }
}

function startCoreOuputeWatch(store) {
  if (store.getState().settings.manualDaemon) {
    return;
  }
  let datadir = configuration.GetCoreDataDir();

  var debugfile;
  if (process.platform === 'win32') {
    debugfile = datadir + '\\debug.log';
  } else {
    debugfile = datadir + '/debug.log';
  }
  debugFileLocation = debugfile;
  fs.stat(debugFileLocation, (err, stat) => {
    checkDebugFileExists(err, stat, store);
  });
  checkIfFileExistsInterval = setInterval(() => {
    if (tail != undefined) {
      clearInterval(checkIfFileExistsInterval);
      return;
    }
    fs.stat(debugFileLocation, (err, stat) => {
      checkDebugFileExists(err, stat, store);
    });
  }, 5000);
}
function checkDebugFileExists(err, stat, store) {
  if (err == null) {
    processDeamonOutput(debugFileLocation, store);
    clearInterval(checkIfFileExistsInterval);
  } else {
  }
}

function processDeamonOutput(debugfile, store) {
  const tailOptions = {
    useWatchFile: true,
  };
  tail = new Tail(debugfile, tailOptions);
  let n = 0;
  let batch = [];
  tail.on('line', d => {
    batch.push(d);
  });
  printCoreOutputTimer = setInterval(() => {
    if (store.getState().ui.console.core.paused) {
      return;
    }
    if (batch.length == 0) {
      return;
    }
    store.dispatch(ac.printCoreOutput(batch));
    batch = [];
  }, 1000);
}
function showInitialModals({ settings }) {
  const showExperimentalWarning = () => {
    if (!settings.experimentalWarningDisabled) {
      UIController.openModal(ExperimentalWarningModal);
    }
  };

  if (!settings.acceptedAgreement) {
    UIController.openModal(LicenseAgreementModal, {
      fullScreen: true,
      onClose: showExperimentalWarning,
    });
  } else {
    showExperimentalWarning();
  }
}
