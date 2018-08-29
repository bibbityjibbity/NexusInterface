import * as TYPE from "./actiontypes";
import * as RPC from "../script/rpc";
import config from "../api/configuration";

export const ToggleModal = () => {
  return dispatch => {
    dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
  };
};

export const SetModalType = modalType => {
  return dispatch => {
    dispatch({ type: TYPE.SET_MODAL_TYPE, payload: modalType });
  };
};

export const EditProtoName = name => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_NAME, payload: name });
  };
};

export const EditProtoPhone = phone => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_PHONE, payload: phone });
  };
};

export const EditProtoNotes = notes => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_NOTES, payload: notes });
  };
};

export const EditProtoAddress = add => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_ADDRESS, payload: add });
  };
};

export const EditProtoTZ = TZ => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_TIMEZONE, payload: TZ });
  };
};

export const EditProtoLabel = label => {
  return dispatch => {
    dispatch({ type: TYPE.EDIT_ADDRESS_LABEL, payload: label });
  };
};

export const SelectedContact = contact => {
  return dispatch => {
    dispatch({ type: TYPE.SELECTED_CONTACT, payload: contact });
  };
};

export const MyAccountsList = list => {
  return dispatch => {
    dispatch({ type: TYPE.MY_ACCOUNTS_LIST, payload: list });
  };
};

export const LabelToggler = (label, address) => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_ADDRESS_LABEL_EDIT,
      payload: { label: label, address: address }
    });
  };
};

export const SaveLabel = (selected, address, label, mine) => {
  let newEntry = { ismine: mine, address: address, label: label };

  return dispatch => {
    dispatch({
      type: TYPE.SAVE_ADDRESS_LABEL,
      payload: {
        newEntry: newEntry,
        address: address,
        newLabel: label,
        index: selected,
        ismine: mine
      }
    });
  };
};

export const NotesToggler = notes => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_NOTES_EDIT,
      payload: notes
    });
  };
};

export const SaveNotes = (selected, notes) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_NOTES,
      payload: { notes: notes, index: selected }
    });
  };
};

export const TzToggler = TZ => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_TIMEZONE_EDIT,
      payload: TZ
    });
  };
};

export const SaveTz = (selected, TZ) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_TIMEZONE,
      payload: { TZ: TZ, index: selected }
    });
  };
};

export const NameToggler = name => {
  console.log("name");
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_NAME_EDIT,
      payload: name
    });
  };
};

export const SaveName = (selected, name) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_NAME,
      payload: { name: name, index: selected }
    });
  };
};

export const PhoneToggler = notes => {
  return dispatch => {
    dispatch({
      type: TYPE.TOGGLE_PHONE_EDIT,
      payload: notes
    });
  };
};

export const SavePhone = (selected, Phone) => {
  return dispatch => {
    dispatch({
      type: TYPE.SAVE_PHONE,
      payload: { Phone: Phone, index: selected }
    });
  };
};

export const ChangeContactImage = (path, contact) => {
  return dispatch => {
    dispatch({
      type: TYPE.CONTACT_IMAGE,
      payload: { path: path, contact: contact }
    });
  };
};

export const ToggleSaveFlag = () => {
  return dispatch => {
    dispatch({ type: TYPE.SET_SAVE_FLAG_FALSE });
  };
};
export const ContactPicSetter = () => {
  return dispatch => {
    dispatch({ type: TYPE.SET_SAVE_FLAG_FALSE });
  };
};
export const AddContact = (name, address, num, notes, TZ) => {
  let mine = [];
  let notMine = [];
  return dispatch => {
    RPC.PROMISE("validateaddress", [address])
      .then(payload => {
        if (payload.isvalid) {
          if (payload.ismine) {
            mine.push({
              label: `My Address for `,
              ismine: true,
              address: address
            });
          } else {
            notMine.push({
              label: `'s Address`,
              ismine: false,
              address: address
            });
          }
        } else alert("Invalid address: ", address);
        return { mine: mine, notMine: notMine };
      })
      .then(result => {
        dispatch({
          type: TYPE.ADD_NEW_CONTACT,
          payload: {
            name: name,
            mine: result.mine,
            notMine: result.notMine,
            notes: notes,
            timezone: TZ,
            phoneNumber: num
          }
        });
        dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
      })
      .catch(e => {
        console.log(e);
      });
  };
};

export const AddAddress = (name, address, index) => {
  return dispatch => {
    RPC.PROMISE("validateaddress", [address])
      .then(payload => {
        if (payload.isvalid) {
          if (payload.ismine) {
            return {
              label: `My Address for ${name}`,
              ismine: true,
              address: address
            };
          } else {
            return {
              label: `${name}'s Address`,
              ismine: false,
              address: address
            };
          }
        } else alert("Invalid address: ", address);
      })
      .then(result => {
        console.log(result);
        dispatch({
          type: TYPE.ADD_NEW_ADDRESS,
          payload: { newAddress: result, index: index }
        });
        dispatch({ type: TYPE.TOGGLE_MODAL_VIS_STATE });
      })
      .catch(e => {
        console.log(e);
      });
  };
};
