import React from 'react';
import { render } from 'react-dom';
import cssUrl from 'react-simple-keyboard/build/css/index.css';

import App from './App';

const linkEl = document.createElement('link');
linkEl.setAttribute('rel', 'stylesheet');
linkEl.setAttribute('type', 'text/css');
linkEl.setAttribute('href', cssUrl);
document.head.appendChild(linkEl);

render(<App />, document.getElementById('root'));
