import * as TYPE from './actiontypes';
import { loadModules } from 'api/modules';

const loadModulesActionCreator = () => async (dispatch, getState) => {
  const state = getState();
  const modules = await loadModules(state.settings);

  dispatch({
    type: TYPE.LOAD_MODULES,
    payload: modules,
  });
};
export { loadModulesActionCreator as loadModules };
