import styled from '@emotion/styled';

import * as color from 'utils/color';

const Divider = styled.div(
  ({ theme, label, backgroundColor, labelColor, dividerColor }) => {
    const colors = {
      background:
        typeof backgroundColor === 'function'
          ? backgroundColor(theme)
          : backgroundColor || color.darken(theme.background, 0.2),
      label:
        typeof labelColor === 'function'
          ? labelColor(theme)
          : labelColor || theme.mixer(0.75),
      divider:
        typeof dividerColor === 'function'
          ? dividerColor(theme)
          : dividerColor || theme.mixer(0.5),
    };

    return {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: colors.background,
      margin: '1em 0',
      position: 'relative',
      '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 1,
        background: colors.divider,
      },
      '&::after': {
        content: `"${label}"`,
        position: 'relative',
        padding: '.3em .6em',
        background: colors.background,
        color: colors.label,
      },
    };
  }
);

export default Divider;
