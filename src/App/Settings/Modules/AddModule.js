// External
import React from 'react';
import Dropzone from 'react-dropzone';
import styled from '@emotion/styled';
import { remote } from 'electron';

// Internal
import { installModule } from 'lib/modules';
import Icon from 'components/Icon';
import FieldSet from 'components/FieldSet';
import Button from 'components/Button';
import { consts, timing } from 'styles';
import * as color from 'utils/color';
import plusCircleIcon from 'images/plus.sprite.svg';

const AddModuleComponent = styled(FieldSet)(
  ({ theme }) => ({
    textAlign: 'center',
    fontSize: '.9em',
    color: theme.mixer(0.75),
    borderColor: theme.mixer(0.375),
    margin: '0 0 1em',
    outline: 'none',
    transitionProperty: 'color, border-color, background-color',
    transitionDuration: timing.normal,
    '&:hover': {
      color: theme.mixer(0.75),
    },
  }),
  ({ active, theme }) =>
    active && {
      background: color.fade(theme.foreground, 0.9),
      color: theme.mixer(0.875),
      borderColor: theme.mixer(0.5),
    }
);

const InnerMessage = styled.div(
  {
    height: consts.lineHeight * 2 + 'em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ({ noPointerEvents }) =>
    noPointerEvents && {
      pointerEvents: 'none',
    }
);

/**
 * The Add Module section in Modules Settings tab
 *
 * @class AddModule
 * @extends {React.Component}
 */
class AddModule extends React.Component {
  state = {
    checking: false,
  };

  /**
   * Open up a Dialog to select a module to install
   *
   * @memberof AddModule
   */
  browseFiles = () => {
    remote.dialog.showOpenDialog(
      {
        title: _('Select module archive file'),
        properties: ['openFile'],
        filters: [
          {
            name: 'Archive',
            extensions: ['zip', 'tar.gz'],
          },
        ],
      },
      paths => {
        if (paths && paths[0]) {
          this.startInstall(paths[0]);
        }
      }
    );
  };

  /**
   * Open up a Dialog to select a directory of a module to install
   *
   * @memberof AddModule
   */
  browseDirectories = () => {
    remote.dialog.showOpenDialog(
      {
        title: _('Select module directory'),
        properties: ['openDirectory'],
      },
      paths => {
        if (paths && paths[0]) {
          this.startInstall(paths[0]);
        }
      }
    );
  };

  /**
   * Override react-dropzone's default getFilesFromEvent function because
   * by default the full paths of dropped files are tripped off
   *
   * @memberof AddModule
   */
  getFilesFromEvent = event => {
    if (!event || !event.dataTransfer) return [];
    if (event.type === 'drop') {
      return Array.from(event.dataTransfer.files);
    } else {
      return Array.from(event.dataTransfer.items);
    }
  };

  /**
   * Handel the file drop event
   *
   * @memberof AddModule
   */
  handleDrop = acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      this.startInstall(acceptedFiles[0].path);
    }
  };

  /**
   * Install the module code into the wallet
   *
   * @memberof AddModule
   */
  startInstall = async path => {
    this.setState({ checking: true });
    try {
      await installModule(path);
    } finally {
      this.setState({ checking: false });
    }
  };

  msgToReact = msg => {
    const [t1, archiveFile] = /#fls#(.*)#fle#/.exec(msg) || [];
    const [t2, directory] = /#dls#(.*)#dle#/.exec(msg) || [];
    if (archiveFile && directory) {
      const string = msg.replace(t1, '|#f#|').replace(t2, '|#d#|');
      const segments = string.split('|');
      return segments.map(t =>
        t === '#f#' ? (
          <Button skin="hyperlink" onClick={this.browseFiles}>
            {archiveFile}
          </Button>
        ) : t === '#d#' ? (
          <Button skin="hyperlink" onClick={this.browseDirectories}>
            {directory}
          </Button>
        ) : (
          t
        )
      );
    } else {
      return null;
    }
  };

  getSelectModuleMsg = () => {
    const enMsg =
      'Select module %{fls}archive file%{fle} or %{dls}directory%{dle}';
    const msg = _(enMsg, {
      fls: '#fls#',
      fle: '#fle#',
      dls: '#dls#',
      dle: '#dle#',
    });
    return this.msgToReact(msg) || this.msgToReact(enMsg);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof AddModule
   */
  render() {
    const { checking } = this.state;

    return (
      <Dropzone
        getFilesFromEvent={this.getFilesFromEvent}
        onDrop={this.handleDrop}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <AddModuleComponent
            {...getRootProps()}
            onClick={
              /* disable dropzone's default file browsing dialog on click */ () => {}
            }
            legend={
              <>
                <Icon icon={plusCircleIcon} />
                <span className="v-align space-left">{_('Add Module')}</span>
              </>
            }
            active={isDragActive || checking}
          >
            <InnerMessage noPointerEvents={isDragActive || checking}>
              {checking ? (
                <div>{_('Checking module')}...</div>
              ) : isDragActive ? (
                <div>{_('Drop here to install')}</div>
              ) : (
                <div>
                  <div>{this.getSelectModuleMsg()}</div>
                  <div>{_('or drag and drop it here')}</div>
                </div>
              )}
            </InnerMessage>
            <input {...getInputProps()} />
          </AddModuleComponent>
        )}
      </Dropzone>
    );
  }
}

export default AddModule;
