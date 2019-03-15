import React from 'react';
import Panel from 'components/Panel';
import ModuleIcon from 'components/ModuleIcon';
import WebView from './WebView';

const PageModule = ({ module }) => (
  <Panel
    title={
      <>
        <ModuleIcon module={module} className="space-right" />
        <span className="v-align">{module.displayName || module.name}</span>
      </>
    }
  >
    <WebView module={module} style={{ width: '100%', height: '100%' }} />
  </Panel>
);

export default PageModule;
