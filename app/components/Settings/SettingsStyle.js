// External
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { ChromePicker } from 'react-color';
import { FormattedMessage } from 'react-intl';
import googleanalytics from 'scripts/googleanalytics';
import styled from '@emotion/styled';

// Internal
import * as TYPE from 'actions/actiontypes';
import styles from './style.css';
import { GetSettings, SaveSettings } from 'api/settings';
import SettingsField from 'components/common/SettingsField';
import Button from 'components/common/Button';
import Switch from 'components/common/Switch';
import Tooltip from 'components/common/Tooltip';

const StyleSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.settings,
    ...state.overview,
  };
};
const mapDispatchToProps = dispatch => ({
  setSettings: settings =>
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  SetWalpaper: path => dispatch({ type: TYPE.SET_WALLPAPER, payload: path }),
  ChangeColor1: hex => dispatch({ type: TYPE.CHANGE_COLOR_1, payload: hex }),
  ChangeColor2: hex => dispatch({ type: TYPE.CHANGE_COLOR_2, payload: hex }),
  ChangeColor3: hex => dispatch({ type: TYPE.CHANGE_COLOR_3, payload: hex }),
  ChangeColor4: hex => dispatch({ type: TYPE.CHANGE_COLOR_4, payload: hex }),
  ChangeColor5: hex => dispatch({ type: TYPE.CHANGE_COLOR_5, payload: hex }),
  setSelectedColorProp: selected =>
    dispatch({ type: TYPE.SET_SELECTED_COLOR_PROP, payload: selected }),
  ChangeNexusLogoColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_NEXUS_LOGO_COLOR,
      payload: { setting: setting, hex: hex },
    }),
  ChangeIconMenuColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_ICON_MENU_COLOR,
      payload: { setting: setting, hex: hex },
    }),
  ChangeFooterColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_FOOTER_COLOR,
      payload: { setting: setting, hex: hex },
    }),
  ChangeFooterHoverColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_FOOTER_HOVER_COLOR,
      payload: { setting: setting, hex: hex },
    }),
  ChangeFooterActiveColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_FOOTER_ACTIVE_COLOR,
      payload: { setting: setting, hex: hex },
    }),
  ChangePanelColor: rgb =>
    dispatch({ type: TYPE.CHANGE_PANEL_COLOR, payload: rgb }),
  ChangeGlobePillarColor: (setting, hex) =>
    dispatch({ type: TYPE.CHANGE_GLOBE_PILLAR_COLOR, payload: { hex: hex } }),
  ChangeGlobeArchColor: (setting, hex) =>
    dispatch({ type: TYPE.CHANGE_GLOBE_ARCH_COLOR, payload: { hex: hex } }),
  ChangeGlobeMultiColor: (setting, hex) =>
    dispatch({ type: TYPE.CHANGE_GLOBE_MULTI_COLOR, payload: { hex: hex } }),
  ResetStyle: () => dispatch({ type: TYPE.RESET_CUSTOM_STYLING }),
  ToggleGlobeRender: () => dispatch({ type: TYPE.TOGGLE_GLOBE_RENDER }),
});

class SettingsStyle extends Component {
  // Class Methods
  constructor() {
    super();

    this.updateWallpaper = this.updateWallpaper.bind(this);
  }

  updateWallpaper(event) {
    let el = event.target;
    let imagePath = el.files[0].path;
    if (process.platform === 'win32') {
      imagePath = imagePath.replace(/\\/g, '/');
    }
    this.props.SetWalpaper(imagePath);
  }

  handleColorChange(color) {
    let filterSetting;
    let H = color.hsl.h - 196.3;
    let S = 100 + (color.hsl.s * 100 - 100);
    let L = 100 + (color.hsl.l * 100 - 46.9);
    if (color.hex === '#ffffff') {
      filterSetting = 'hue-rotate(0deg) brightness(200%) grayscale(100%)';
    } else if (color.hex === '#000000') {
      filterSetting = 'hue-rotate(0deg) brightness(0%) grayscale(100%)';
    } else {
      filterSetting = `hue-rotate(${H}deg) brightness(${L}%) grayscale(0%) saturate(${S}%)`;
    }
    switch (this.props.selectedColorProp) {
      case 'MC1':
        this.props.ChangeColor1(color.hex);
        break;
      case 'MC2':
        this.props.ChangeColor2(color.hex);
        break;
      case 'MC3':
        this.props.ChangeColor3(color.hex);
        break;
      case 'MC4':
        this.props.ChangeColor4(color.hex);
        break;
      case 'MC5':
        this.props.ChangeColor5(color.hex);
        break;
      case 'NXSlogo':
        this.props.ChangeNexusLogoColor(filterSetting, color.hex);
        break;
      case 'iconMenu':
        this.props.ChangeIconMenuColor(filterSetting, color.hex);
        break;
      case 'footer':
        this.props.ChangeFooterColor(filterSetting, color.hex);
        break;
      case 'footerHover':
        this.props.ChangeFooterHoverColor(filterSetting, color.hex);
        break;
      case 'footerActive':
        this.props.ChangeFooterActiveColor(filterSetting, color.hex);
        break;
      case 'globePillar':
        this.props.ChangeGlobePillarColor(filterSetting, color.hex);
        break;
      case 'globeArch':
        this.props.ChangeGlobeArchColor(filterSetting, color.hex);
        break;
      case 'globeMulti':
        this.props.ChangeGlobeMultiColor(filterSetting, color.hex);
        break;
      case 'panel':
        let newPannelBack = `rgba(${color.rgb.r}, ${color.rgb.g}, ${
          color.rgb.b
        }, 0.7)`;
        this.props.ChangePanelColor(newPannelBack);
        break;
      default:
        break;
    }
  }

  colorPresetter() {
    this.props.settings.customStyling[this.props.selectedColorProp];
    switch (this.props.selectedColorProp) {
      case 'MC1':
        return this.props.settings.customStyling.MC1;
        break;
      case 'MC2':
        return this.props.settings.customStyling.MC2;
        break;
      case 'MC3':
        return this.props.settings.customStyling.MC3;
        break;
      case 'MC4':
        return this.props.settings.customStyling.MC4;
        break;
      case 'MC5':
        return this.props.settings.customStyling.MC5;
        break;
      case 'NXSlogo':
        return this.props.NXSlogoRGB;
        break;
      case 'iconMenu':
        return this.props.iconMenuRGB;
        break;
      case 'footer':
        return this.props.footerRGB;
        break;
      case 'footerHover':
        return this.props.footerHoverRGB;
        break;
      case 'footerActive':
        return this.props.footerActiveRGB;
        break;
      case 'globePillar':
        return this.props.settings.customStyling.globePillarColorRGB;
        break;
      case 'globeArch':
        return this.props.settings.customStyling.globeArchColorRGB;
        break;
      case 'globeMulti':
        return this.props.settings.customStyling.globeMultiColorRGB;
        break;
      case 'panel':
        return this.props.settings.customStyling.pannelBack;
        break;
      default:
        break;
    }
  }

  updateRenderGlobe() {
    let settings = GetSettings();
    settings.renderGlobe = !this.props.settings.renderGlobe;
    SaveSettings(settings);
  }

  SaveSettings() {
    SaveSettings(this.props.settings);
    this.props.OpenModal('Style Settings Saved');

    googleanalytics.SendEvent('Settings', 'Style', 'Saved', 1);
  }

  // Mandatory React method
  render() {
    console.log(this.props.messages);
    return (
      <StyleSettings>
        <form>
          <SettingsField
            connectlabel
            label={
              <FormattedMessage
                id="Settings.RenderGlobe"
                defaultMessage="Render Globe"
              />
            }
            subLabel={
              <FormattedMessage
                id="ToolTip.RenderGlobe"
                defaultMessage="Render the globe on the Overview page"
              />
            }
          >
            <Tooltip.Trigger
              tooltip={
                !this.props.webGLEnabled && (
                  <FormattedMessage
                    id="ToolTip.RenderGlobeOpenGLFail"
                    defaultMessage="Your Computer does not support OPENGL 2.0"
                  />
                )
              }
            >
              <Switch
                disabled={!this.props.webGLEnabled}
                checked={this.props.settings.renderGlobe}
                onChange={() => {
                  this.props.ToggleGlobeRender();
                  this.updateRenderGlobe();
                }}
              />
            </Tooltip.Trigger>
          </SettingsField>

          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <div />
            <Button
              skin="primary"
              onClick={e => {
                e.preventDefault();
                this.SaveSettings();
              }}
            >
              <FormattedMessage
                id="Settings.SaveSettings"
                defaultMessage="Save Settings"
              />
            </Button>
          </div>
        </form>
      </StyleSettings>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsStyle);
