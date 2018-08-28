import * as TYPE from "./actiontypes";
import * as RPC from "../script/rpc";

export const GetInfoDump = () => {
  return dispatch => {
    RPC.PROMISE("getinfo", [])
      .then(payload => {
        delete payload.timestamp;
        return payload;
      })
      .then(payload => {
        dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload });
      });
  };
};

export const Lock = () => {
  return dispatch => {
    dispatch({ type: TYPE.LOCK });
  };
};

export const Unlock = () => {
  return dispatch => {
    dispatch({ type: TYPE.UNLOCK });
  };
};

export const Encrypted = () => {
  return dispatch => {
    dispatch({ type: TYPE.ENCRYPTED });
  };
};

export const Unencrypted = () => {
  return dispatch => {
    dispatch({ type: TYPE.UNENCRYPTED });
  };
};
export const OpenModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.SHOW_MODAL });
  };
};
export const CloseModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL });
  };
};
export const OpenModal2 = () => {
  return dispatch => {
    dispatch({ type: TYPE.SHOW_MODAL2 });
  };
};
export const CloseModal2 = () => {
  return dispatch => {
    dispatch({ type: TYPE.HIDE_MODAL2 });
  };
};

export const SetGoogleAnalytics = returnData => {
  return dispatch => {
    dispatch({ type: TYPE.SET_GOOGLEANALYTICS, payload: returnData });
  };
};
