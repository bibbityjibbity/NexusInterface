import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';
import { configureStore, history } from './store/configureStore';
import { GetSettings } from 'api/settings';
import { colors } from 'styles';
import './CSS/app.global.css';

const store = configureStore();

// Configure custom colors
// const settings = GetSettings();
// colors.customize(settings.customStyling);

function renderApp(Component) {
  render(
    <AppContainer>
      <Component store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
}

renderApp(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    renderApp(App);
  });
}
