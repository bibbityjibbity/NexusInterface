// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

import { timing } from 'styles';
import { color, newUID } from 'utils';

const Option = styled.label(
  ({ theme }) => ({
    display: 'block',
    padding: '.4em .8em',
    transition: `background-color ${timing.normal}`,
    cursor: 'pointer',

    '&:hover': {
      background: theme.background,
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.darken(theme.primary, 0.2),
      },
    }
);

class BackgroundPicker extends Component {
  fileInputID = newUID();

  setDefault = () => {
    this.props.onChange(null);
  };

  handleFilePick = e => {
    if (!!e.target.files.length) {
      let imagePath = e.target.files[0].path;
      if (process.platform === 'win32') {
        imagePath = imagePath.replace(/\\/g, '/');
      }
      console.log(imagePath);
      this.props.onChange(imagePath);
    }
  };

  render() {
    const { wallpaper } = this.props;
    return (
      <div>
        <Option
          onClick={this.setDefault}
          selected={!wallpaper}
          style={{ marginBottom: '.5em' }}
        >
          Twinkling Starry Sky background
        </Option>
        <Option htmlFor={this.fileInputID} selected={!!wallpaper}>
          {wallpaper
            ? `Custom Wallpaper: ${wallpaper}`
            : 'Select a Custom Wallpaper'}
        </Option>
        <input
          id={this.fileInputID}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={this.handleFilePick}
        />
      </div>
    );
  }
}

export default BackgroundPicker;
