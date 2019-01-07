// External
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import { timing, animations } from 'styles';
import { color } from 'utils';

const notifHeight = 40;
const notifMargin = 15;

const intro = index => keyframes`
  from {
    opacity: 0;
    transform: translateY(-${(index - 1) * (notifHeight + notifMargin)}px)
  }
  to {
    opacity: 1;
    transform: translateY(${index * (notifHeight + notifMargin)})
  }
`;

const SnackBar = styled.div(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: 15,
    height: notifHeight,
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5em',
    borderRadius: 2,
    boxShadow: '0 0 8px rgba(0,0,0,.7)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, transform',
    transitionDuration: timing.normal,
  },

  ({ index }) => ({
    transform: `translateY(${index * (notifHeight + notifMargin)}px)`,
    animation: `${intro(index)} ${timing.normal} ease-out`,
  }),

  ({ type, theme }) => {
    switch (type) {
      case 'info':
        return {
          background: theme.darkerGray,
          color: theme.light,
          '&:hover': {
            background: color.lighten(theme.darkerGray, 0.2),
          },
        };
      case 'success':
        return {
          background: color.darken(theme.primary, 0.3),
          color: theme.primaryContrast,
          '&:hover': {
            background: color.darken(theme.primary, 0.1),
          },
        };
      case 'error':
        return {
          background: color.darken(theme.error, 0.2),
          color: theme.errorContrast,
          '&:hover': {
            background: theme.error,
          },
        };
      case 'work':
        return {
          background: theme.dark,
          border: `1px solid ${theme.gray}`,
          color: theme.light,
          '&:hover': {
            background: color.lighten(theme.dark, 0.2),
          },
        };
    }
  },

  ({ closing }) =>
    closing && {
      animation: `${animations.fadeOut} ${timing.normal} ease-out`,
    }
);

export default SnackBar;
