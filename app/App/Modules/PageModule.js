import React from 'react';
import WebView from './WebView';

const PageModule = ({ module }) => (
  <WebView
    /* Set key attribute here so that the WebView instance will be reset and 
      componentDidMount will be called when it navigates to another module of the same type */
    key={module.name}
    module={module}
    style={{ width: '100%', height: '100%' }}
  />
);

export default PageModule;
