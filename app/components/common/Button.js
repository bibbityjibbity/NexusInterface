import React from 'react';
import styled from '@emotion/styled';
import { colors, timing } from 'styles';
import { lighten, fade } from 'utils/colors';

const Button = styled.button(
  {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: '0.7em 1.5em',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transitionProperty: 'border-color, color',
    transitionDuration: timing.normal,
    // Default styles
    '&, &:active, &&[disabled]': {
      border: `2px solid ${colors.lightGray}`,
      color: colors.lightGray,
    },
    '&:hover': {
      borderColor: colors.light,
      color: colors.light,
    },
  },

  ({ primary }) =>
    !!primary && {
      '&, &:active, &&[disabled]': {
        border: `2px solid ${colors.primary}`,
        color: colors.primary,
        fontWeight: 'bold',
        transitionProperty: 'border-color, color, box-shadow, text-shadow',
        boxShadow: 'none',
        textSahdow: 'none',
      },
      '&:hover': {
        borderColor: lighten(colors.primary, 0.3),
        color: lighten(colors.primary, 0.3),
        boxShadow: `0 0 20px ${fade(colors.primary, 0.7)}`,
        textShadow: `0 0 20px ${fade(colors.primary, 0.7)}`,
      },
    },

  ({ blank, dark }) =>
    !!blank && {
      '&, &:active, &&[disabled]': {
        padding: '0.5em 1em',
        border: 'none',
        backgroundColor: 'transparent',
        color: dark ? colors.darkGray : colors.lightGray,
        transitionProperty: 'color',
      },
      '&:hover': {
        border: 'none',
        color: dark ? colors.dark : colors.light,
      },
    },

  ({ disabled }) =>
    !!disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }
);

/**
 * Note: the double & in &&[disabled] is a css specificity hack so that the disabled styles take priority over the hover styles
 */

export default Button;
