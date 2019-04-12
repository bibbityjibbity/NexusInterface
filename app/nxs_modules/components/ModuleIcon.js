import React from 'react';
import DOMPurify from 'dompurify';
import { readFileSync } from 'fs';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import legoBlockIcon from 'images/lego-block.sprite.svg';

const SvgWrapper = styled.span({
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  '& > svg': {
    width: '1em',
    height: '1em',
  },
});

const Img = styled.img({
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  width: '1em',
  height: '1em',
});

const loadSVGContent = path => {
  try {
    const content = readFileSync(path);
    return DOMPurify.sanitize(content);
  } catch (err) {
    return null;
  }
};

const getCachedSVG = (() => {
  const cache = {};
  return path =>
    cache[path] === undefined
      ? (cache[path] = loadSVGContent(path))
      : cache[path];
})();

const ModuleIcon = ({ module, ...rest }) => {
  if (module.iconPath) {
    if (module.iconPath.endsWith('.svg')) {
      const iconContent = getCachedSVG(module.iconPath);
      if (iconContent) {
        return (
          <SvgWrapper
            {...rest}
            // The icon content has already been sanitized by DOMPurify
            // so it's already safe to insert into html
            dangerouslySetInnerHTML={{ __html: iconContent }}
          />
        );
      }
    } else {
      return <Img src={module.iconPath} {...rest} />;
    }
  }

  return <Icon icon={legoBlockIcon} {...rest} />;
};

export default ModuleIcon;
