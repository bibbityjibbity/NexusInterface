/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

// Internal
import { animations, timing, zIndex } from 'styles';

const OverlayComponent = styled.div(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ({ zPriority = 0 }) => ({
    zIndex: zIndex.overlays + zPriority,
  })
);

const OverlayBackground = styled.div(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animation: `${animations.fadeIn} ${timing.quick} ease-out`,
    animationFillMode: 'both',
  },
  ({ dimmed }) =>
    dimmed && {
      background: 'rgba(0,0,0,0.5)',
    }
);

export default class Overlay extends Component {
  node = document.createElement('div');

  componentDidMount() {
    document.getElementsByTagName('body')[0].appendChild(this.node);
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].removeChild(this.node);
  }

  render() {
    const {
      dimBackground,
      onBackgroundClick,
      backgroundRef,
      children,
      zPriority,
      ...rest
    } = this.props;
    return ReactDOM.createPortal(
      <OverlayComponent {...rest}>
        <OverlayBackground
          ref={backgroundRef}
          dimmed={dimBackground}
          onClick={onBackgroundClick}
          zPriority={zPriority}
        />
        {children}
      </OverlayComponent>,
      this.node
    );
  }
}
