// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import fs from 'fs';
import styled from '@emotion/styled';
import https from 'https';

// Internal
import { updateSettings } from 'actions/settingsActionCreators';
import { updateTheme, resetColors } from 'actions/themeActionCreators';
import Text from 'components/Text';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import UIController from 'components/UIController';
import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';
import configuration from 'api/configuration';
import ThemePicker from './ThemePicker';

import DarkTheme from './Dark.json';
import LightTheme from './Light.json';

const StyleSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

const mapStateToProps = ({
  settings: { renderGlobe },
  overview: { webGLEnabled },
  theme,
}) => {
  return {
    renderGlobe,
    webGLEnabled,
    theme,
  };
};
const mapDispatchToProps = dispatch => ({
  setRenderGlobe: renderGlobe => dispatch(updateSettings({ renderGlobe })),
  updateTheme: updates => dispatch(updateTheme(updates)),
  resetColors: () => dispatch(resetColors()),
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class SettingsStyle extends Component {
  state = {
    previousCustom: {},
    DarkTheme: DarkTheme,
    LightTheme: LightTheme,
  }

  componentDidMount() {

    if (this.props.theme.defaultStyle == "Dark") {
      this.setThemeSelector(0);
    }
    else if (this.props.theme.defaultStyle == "Light") {
      this.setThemeSelector(1);
    }
    else {
      this.setThemeSelector(2);
    }
  }

  toggleGlobeRender = e => {
    this.props.setRenderGlobe(e.target.checked);
  };

  setWalpaper = (path, defaultStyle) => {

    defaultStyle = defaultStyle ? defaultStyle : this.props.theme.defaultStyle;
    this.props.updateTheme({ defaultStyle: defaultStyle, wallpaper: path, });
    if (path || defaultStyle.endsWith('Custom')) {
      this.setThemeSelector(2);
      if (path) {
        this.props.updateTheme({ defaultStyle: "Custom", });
      }
    }
  };

  setColor = (key, value) => {
    this.setToCustom();
    this.props.updateTheme({
      [key]: value,
      defaultStyle: "Custom",
    });
  };

  resetColors = () => {
    //Dont think we need this anymore 
    this.props.resetColors();
    UIController.showNotification(
      'Color scheme has been reset to default',
      'success'
    );
  };

  loadCustomTheme = filepath => {
    const content = fs.readFileSync(filepath);
    let customTheme;
    try {
      customTheme = JSON.parse(content);
      if (customTheme.wallpaper.startsWith('https') || customTheme.wallpaper.startsWith('http')) {
        const wallpaperPathSplit = customTheme.wallpaper.split('.');
        const fileEnding = wallpaperPathSplit[wallpaperPathSplit.length - 1];
        const file = fs.createWriteStream(configuration.GetAppDataDirectory() + "/wallpaper." + fileEnding);
        this.wallpaperRequest = https.get(customTheme.wallpaper)
          .setTimeout(10000)
          .on('response', response => {
            response.pipe(file);
            let onFinish = () => {
              file.close(response => {
                console.log(this);
                console.log("FInished DOwnloading");
                this.setWalpaper(file.path);
              });
            }
            onFinish.bind(this);
            file.on('finish', () => onFinish());
          })
          .on('error', error => {
            this.setWalpaper("");
          })
          .on('timeout', timeout => {
            this.setWalpaper("");
          });
      }
    } catch (err) {
      UIController.showNotification(
        'Invalid file format! Custom theme file must be in JSON',
        'error'
      );
    }
    customTheme.defaultStyle = 'Custom';
    this.props.updateTheme(customTheme);
  };

  openPickThemeFileDialog = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Select Custom Theme File',
        properties: ['openFile'],
        filters: [{ name: 'Theme JSON', extensions: ['json'] }],
      },
      files => {
        if (files && files.length > 0) {
          this.loadCustomTheme(files[0]);
        }
      }
    );
  };

  exportThemeFileDialog = () => {
    remote.dialog.showSaveDialog(
      null,
      {
        title: 'Save Theme File',
        properties: ['saveFile'],
        filters: [{ name: 'Theme JSON', extensions: ['json'] }],
      },
      (path) => {
        console.log(path);
        fs.copyFile(configuration.GetAppDataDirectory() + "/theme.json", path, (err) => {
          if (err) {
            console.error(err);
            UIController.showNotification(
              err,
              'error'
            );
          }
          UIController.showNotification(
            'Theme Exported',
            'success'
          );
        });
      }
    )
  }

  pressDarkTheme = () => {
    this.props.updateTheme(DarkTheme);
  }
  pressLightTheme = () => {
    this.props.updateTheme(LightTheme);
  }
  pressCustomTheme = () => {
    if (this.state.previousCustom != {}) {
      this.props.updateTheme(this.state.previousCustom);
    }
  }
  pressResetTheme = () => {
    this.props.updateTheme(DarkTheme);
    this.setThemeSelector(0);
    UIController.showNotification(
      'Color scheme has been reset to default',
      'success'
    );
  }

  savePreviousCustomTheme = () => {
    this.setState({ previousCustom: this.props.theme }, () => { console.log(this.state); });
  }

  setToCustom = () => {
    console.log("Set To Custom")
  }

  setThemeSelector = (selectorIndex) => {

  }

  render() {
    const { theme, renderGlobe, webGLEnabled } = this.props;

    return (
      <StyleSettings>
        <SettingsField
          connectLabel
          label={<Text id="Settings.RenderGlobe" />}
          subLabel={
            <div>
              <Text id="ToolTip.RenderGlobe" />
              {!webGLEnabled && (
                <div className="error">
                  <Text id="ToolTip.RenderGlobeOpenGLFail" />
                </div>
              )}
            </div>
          }
        >
          <Switch
            disabled={!webGLEnabled}
            checked={renderGlobe}
            onChange={this.toggleGlobeRender}
          />
        </SettingsField>

        <SettingsField
          label="Theme"
          subLabel="Select Wallet Theme"

        >
          <ThemePicker
            parentTheme={theme}
            darkCallback={this.pressDarkTheme}
            lightCallback={this.pressLightTheme}
            customCallback={this.pressCustomTheme}
            resetCallback={this.pressResetTheme}
            saveCustomCallback={this.savePreviousCustomTheme}
            handleOnSetCustom={e => (this.setToCustom = e)}
            handleSetSelector={e => (this.setThemeSelector = e)}
          >

          </ThemePicker>
        </SettingsField>

        <SettingsField
          label="Background"
          subLabel="Customize your background wallpaper"
        >
          <BackgroundPicker
            wallpaper={theme.wallpaper}
            defaultStyle={theme.defaultStyle}
            onChange={this.setWalpaper}
          />
        </SettingsField>

        <SettingsField label="Color scheme">
        </SettingsField>

        <SettingsField indent={1} label={<Text id="Cp.PBC" />}>
          <ColorPicker colorName="background" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.TC" />}>
          <ColorPicker colorName="foreground" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.PC" />}>
          <ColorPicker colorName="primary" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.PCA" />}>
          <ColorPicker colorName="primaryAccent" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.ER" />}>
          <ColorPicker colorName="danger" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.ERA" />}>
          <ColorPicker colorName="dangerAccent" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.GC" />}>
          <ColorPicker colorName="globeColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={2} label={<Text id="Cp.GPC" />}>
          <ColorPicker colorName="globePillarColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={2} label={<Text id="Cp.GAC" />}>
          <ColorPicker colorName="globeArchColor" onChange={this.setColor} />
        </SettingsField>

        <div style={{ marginTop: '2em' }}>
          <Button onClick={this.openPickThemeFileDialog}>
            <Text id="Settings.PickThemeFile" />
          </Button>
          <Button onClick={this.exportThemeFileDialog}>
            <Text id="Settings.ThemeFileExport" />
          </Button>
        </div>
      </StyleSettings>
    );
  }
}
