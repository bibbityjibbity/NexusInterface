import { remote } from 'electron';

import rpc from 'lib/rpc';
import * as ac from 'actions/setupApp';
import * as TYPE from 'consts/actionTypes';
import { legacyMode } from 'consts/misc';
import { apiPost } from 'lib/tritiumApi';

const getSystemInfo = async dispatch => {
  try {
    const systemInfo = await apiPost('system/get/info');
    dispatch({ type: TYPE.GET_SYSTEM_INFO, payload: systemInfo });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_CORE_INFO });
    console.error('get/info failed', err);
    throw err;
  }
};

const getStakeInfo = async dispatch => {
  try {
    const stakeInfo = await apiPost('finance/get/stakeinfo');
    dispatch({ type: TYPE.GET_STAKE_INFO, payload: stakeInfo });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_STAKE_INFO });
    console.error('get/stakeinfo failed', err);
  }
};

export const getInfo = legacyMode
  ? // Legacy
    () => async dispatch => {
      dispatch(ac.AddRPCCall('getInfo'));
      try {
        const info = await rpc('getinfo', []);
        dispatch({ type: TYPE.GET_INFO, payload: info });
      } catch (err) {
        dispatch({ type: TYPE.CLEAR_CORE_INFO });
        console.error(err);
        throw err;
      }
    }
  : // Tritium
    () => async dispatch => {
      // getSysmteInfo to check if core is connected first
      await getSystemInfo();
      // then get more detailed info later
      await getStakeInfo();
    };

export const getBalances = async dispatch => {
  try {
    const balances = await apiPost('finance/get/balances');
    dispatch({ type: TYPE.GET_BALANCES, payload: balances });
  } catch (err) {
    dispatch({ type: TYPE.CLEAR_BALANCES });
    console.error('get/balances failed', err);
  }
};

export const getDifficulty = () => async dispatch => {
  const diff = await rpc('getdifficulty', []);
  dispatch({ type: TYPE.GET_DIFFICULTY, payload: diff });
};

const stopAutoConnect = () => ({
  type: TYPE.STOP_CORE_AUTO_CONNECT,
});

const startAutoConnect = () => ({
  type: TYPE.START_CORE_AUTO_CONNECT,
});

export const stopCore = () => async (dispatch, getState) => {
  dispatch({ type: TYPE.CLEAR_CORE_INFO });
  await remote.getGlobal('core').stop();
  const { manualDaemon } = getState().settings;
  if (!manualDaemon) {
    dispatch(stopAutoConnect());
  }
};

export const startCore = () => async dispatch => {
  await remote.getGlobal('core').start();
  dispatch(startAutoConnect());
};

export const restartCore = () => async dispatch => {
  dispatch({ type: TYPE.CLEAR_CORE_INFO });
  await remote.getGlobal('core').restart();
  dispatch(startAutoConnect());
};
