import * as TYPE from 'consts/actionTypes';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_CORE_CONFIG:
      return action.payload;

    default:
      return state;
  }
};
