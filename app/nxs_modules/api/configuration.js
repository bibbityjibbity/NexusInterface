//////////////////////////////////////////////////////
//
// Configuration Manager
//
//////////////////////////////////////////////////////

var configuration = exports;

//
// Exists: Check if a configuration file exists
//

configuration.Exists = function(filename) {
  var fs = require('fs');
  const path = require('path');
  try {
    fs.accessSync(path.join(this.GetAppDataDirectory(), filename));

    return true;
  } catch (err) {
    return false;
  }
};

//
// Read: Read a configuration file
//

configuration.Read = function(filename) {
  var fs = require('fs');
  const path = require('path');
  try {
    return fs.readFileSync(path.join(this.GetAppDataDirectory(), filename));
  } catch (err) {
    console.log('Error reading file: ' + filename + ' => ' + err);

    return undefined;
  }
};

//
// ReadJson: Read a json configuration file and return a json object
//

configuration.ReadJson = function(filename) {
  //
  // TODO: Is utf-8 required here?
  //

  var json = this.Read(filename);

  if (!json) return {};

  return JSON.parse(json);
};

//
// Write: Update a configuration file with provided content
//

configuration.Write = function(filename, content) {
  var fs = require('fs');
  const path = require('path');
  //  if (!this.Exists("settings.json")) {
  //    console.log("Creating settings.json in " + this.GetAppDataDirectory());
  //    fs.closeSync(fs.openSync(path.join(this.GetAppDataDirectory(), "settings.json"), 'w'));
  //    fs.writeFileSync(path.join(this.GetAppDataDirectory(), "settings.json"), '{}');
  //  }
  try {
    fs.writeFileSync(path.join(this.GetAppDataDirectory(), filename), content);

    return true;
  } catch (err) {
    console.log('Error writing file: ' + filename + ' => ' + err);

    return false;
  }
};

//
// WriteJson: Update a json configuration file with provided json object
//

configuration.WriteJson = function(filename, json) {
  //
  // TODO: Is utf-8 required here?
  //

  return this.Write(filename, JSON.stringify(json, null, 2)); // pretty print the json so it is human readable
};

//
// Delete: Delete the configuration file
//

configuration.Delete = function(filename) {
  var fs = require('fs');
  const path = require('path');
  try {
    fs.unlink(path.join(this.GetAppDataDirectory(), filename));

    return true;
  } catch (err) {
    console.log('Error deleting file: ' + filename + ' => ' + err);

    return false;
  }
};

//
// Rename: Rename a configuration file
//

configuration.Rename = function(oldFilename, newFilename) {
  var fs = require('fs');
  const path = require('path');
  try {
    fs.renameSync(
      path.join(this.GetAppDataDirectory(), oldFilename),
      path.join(this.GetAppDataDirectory(), newFilename)
    );

    return true;
  } catch (err) {
    console.log('Error renaming file: ' + filename + ' => ' + err);

    return false;
  }
};

configuration.Start = function() {
  var fs = require('fs');
  if (!fs.existsSync(this.GetAppDataDirectory())) {
    fs.mkdirSync(this.GetAppDataDirectory());
  }

  if (!fs.existsSync(this.GetAppResourceDir())) {
    fs.mkdirSync(this.GetAppResourceDir());
  }
};

//
// GetAppDataDirectory: Get the application data directory
//

configuration.GetAppDataDirectory = function() {
  const electron = require('electron');
  const path = require('path');
  const app = electron.app || electron.remote.app;
  let AppDataDirPath = '';

  if (process.platform === 'darwin') {
    AppDataDirPath = path.join(
      app
        .getPath('appData')
        .replace(' ', `\ `)
        .replace('/Electron/', ''),
      'Nexus_Wallet_BETA_v0.8.4'
    );
  } else {
    AppDataDirPath = path.join(
      app.getPath('appData').replace('/Electron/', ''),
      'Nexus_Wallet_BETA_v0.8.4'
    );
  }

  return AppDataDirPath;
};

configuration.GetCoreDataDir = function() {
  var datadir = '';

  //Set data directory by OS for automatic daemon mode
  if (process.platform === 'win32') {
    var datadir = process.env.APPDATA + '\\Nexus_Core_Data_BETA_v0.8.4';
  } else if (process.platform === 'darwin') {
    var datadir = process.env.HOME + '/.Nexus_Core_Data_BETA_v0.8.4';
  } else {
    var datadir = process.env.HOME + '/.Nexus_Core_Data_BETA_v0.8.4';
  }
  return datadir;
};

configuration.GetAppResourceDir = function() {
  const electron = require('electron');
  const path = require('path');
  const app = electron.app != undefined ? electron.app : electron.remote.app;
  let rawPath = '';
  if (process.platform === 'darwin') {
    rawPath = path.dirname(app.getPath('exe')) + '/../Resources/app/';
  } else {
    rawPath = path.dirname(app.getPath('exe')) + '/resources/app/';
  }
  if (process.env.NODE_ENV_RUN == 'production-test') {
    rawPath = path.join(rawPath, '..', '..', '..', '..', '..', 'app');
  }
  if (process.platform == 'win32') {
    return path.win32.normalize(rawPath);
  } else {
    return path.normalize(rawPath);
  }
};

configuration.GetBootstrapSize = async function() {
  let remote = require('remote-file-size');
  const url = 'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';

  let total = 0;
  let promise = new Promise((resolve, reject) => {
    remote(url, function(err, totalBytes) {
      resolve(totalBytes);
    });
  });
  await promise;
  return promise;
};

configuration.BootstrapRecentDatabase = async function(self) {
  const RPC = require('scripts/rpc');
  const fs = require('fs');
  const path = require('path');
  const electron = require('electron');
  const tarball = require('tarball-extract');
  const moveFile = require('move-file');

  let totalDownloadSize = await configuration.GetBootstrapSize();

  let now = new Date()
    .toString()
    .slice(0, 24)
    .split(' ')
    .reduce((a, b) => {
      return a + '_' + b;
    })
    .replace(/:/g, '_');
  let BackupDir = process.env.HOME + '/NexusBackups';
  if (process.platform === 'win32') {
    BackupDir = process.env.USERPROFILE + '/NexusBackups';
    BackupDir = BackupDir.replace(/\\/g, '/');
  }
  if (self.props.settings.Folder !== BackupDir) {
    BackupDir = self.props.settings.Folder;
  }

  let ifBackupDirExists = fs.existsSync(BackupDir);
  if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
    fs.mkdirSync(BackupDir);
  }
  RPC.PROMISE('backupwallet', [
    BackupDir + '/NexusBackup_' + now + '.dat',
  ]).then(() => {
    self.context.showNotification('Wallet backed up', 'success');
    electron.remote
      .getGlobal('core')
      .stop()
      .then(() => {
        self.props.clearOverviewVariables();
        let tarGzLocation = path.join(
          this.GetAppDataDirectory(),
          'recent.tar.gz'
        );
        if (fs.existsSync(tarGzLocation)) {
          fs.unlink(tarGzLocation, err => {
            if (err) throw err;
            console.log('recent.tar.gz was deleted');
          });
        }

        let datadir = configuration.GetCoreDataDir();

        const url =
          'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';
        tarball.extractTarballDownload(
          url,
          tarGzLocation,
          datadir,
          {},
          function(err, result) {
            fs.stat(
              path.join(configuration.GetAppDataDirectory(), 'recent.tar.gz'),
              (stat, things) => console.log(stat, things)
            );
            try {
              let recentContents = fs.readdirSync(path.join(datadir, 'recent'));

              for (let i = 0; i < recentContents.length; i++) {
                const element = recentContents[i];
                if (
                  fs
                    .statSync(path.join(datadir, 'recent', element))
                    .isDirectory()
                ) {
                  let newcontents = fs.readdirSync(
                    path.join(datadir, 'recent', element)
                  );

                  for (let i = 0; i < newcontents.length; i++) {
                    const deeperEle = newcontents[i];
                    moveFile.sync(
                      path.join(datadir, 'recent', element, deeperEle),
                      path.join(datadir, element, deeperEle)
                    );
                  }
                } else {
                  moveFile.sync(
                    path.join(datadir, 'recent', element),
                    path.join(datadir, element)
                  );
                }
              }
            } catch (error) {
              console.log('Direct bootstrap');
            }
            if (err) {
              self.context.openErrorModal({ message: result.error });
            }
            console.log(err, result);
            electron.remote.getGlobal('core').start();
          }
        );
      })
      .catch(e => {
        self.context.openErrorModal({ message: e });
      });

    let prevDownloadPercentArr = [];

    let percentChecker = setInterval(() => {
      fs.stat(
        path.join(configuration.GetAppDataDirectory(), 'recent.tar.gz'),
        (err, stats) => {
          console.log((stats.size / totalDownloadSize) * 100);
          let sample = (stats.size / totalDownloadSize) * 100;
          prevDownloadPercentArr.push(sample);
          let checkarr = prevDownloadPercentArr.filter(ele => {
            if (ele === self.props.percentDownloaded) {
              return ele;
            }
          });

          if (checkarr.length > 20 && self.props.percentDownloaded < 100) {
            prevDownloadPercentArr = [];
            console.log('Connection Failure');
            self.props.setPercentDownloaded('Connection Failure');
            clearInterval(percentChecker);
          } else {
            self.props.setPercentDownloaded(
              (stats.size / totalDownloadSize) * 100
            );
          }
        }
      );

      let checkarr = prevDownloadPercentArr.filter(ele => {
        if (ele === self.props.percentDownloaded) {
          return ele;
        }
      });

      if (checkarr.length > 20 && self.props.percentDownloaded < 100) {
        prevDownloadPercentArr = [];
        console.log('Connection Failure');
        self.props.setPercentDownloaded('Connection Failure');
        clearInterval(percentChecker);
      }
    }, 3000);

    electron.remote.getGlobal('core').on('starting', () => {
      self.CloseBootstrapModalAndSaveSettings();
      clearInterval(percentChecker);
      self.props.setPercentDownloaded(0);
      self.CloseBootstrapModalAndSaveSettings();
      let tarGzLocation = path.join(
        this.GetAppDataDirectory(),
        'recent.tar.gz'
      );
      if (fs.existsSync(tarGzLocation)) {
        fs.unlink(tarGzLocation, err => {
          if (err) throw err;
          console.log('recent.tar.gz was deleted');
        });
      }
    });
  });
};

configuration.bootstrapTryAgain = async function(self) {
  const fs = require('fs');
  const path = require('path');
  const electron = require('electron');
  const tarball = require('tarball-extract');
  const moveFile = require('move-file');

  let totalDownloadSize = await configuration.GetBootstrapSize();

  let now = new Date()
    .toString()
    .slice(0, 24)
    .split(' ')
    .reduce((a, b) => {
      return a + '_' + b;
    })
    .replace(/:/g, '_');
  let BackupDir = process.env.HOME + '/NexusBackups';
  if (process.platform === 'win32') {
    BackupDir = process.env.USERPROFILE + '/NexusBackups';
    BackupDir = BackupDir.replace(/\\/g, '/');
  }
  if (self.props.settings.Folder !== BackupDir) {
    BackupDir = self.props.settings.Folder;
  }

  let ifBackupDirExists = fs.existsSync(BackupDir);
  if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
    fs.mkdirSync(BackupDir);
  }

  electron.remote
    .getGlobal('core')
    .stop()
    .then(() => {
      self.props.clearOverviewVariables();
      let tarGzLocation = path.join(
        this.GetAppDataDirectory(),
        'recent.tar.gz'
      );
      if (fs.existsSync(tarGzLocation)) {
        fs.unlink(tarGzLocation, err => {
          if (err) throw err;
          console.log('recent.tar.gz was deleted');
        });
      }

      let datadir = configuration.GetCoreDataDir();

      const url = 'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';
      tarball.extractTarballDownload(url, tarGzLocation, datadir, {}, function(
        err,
        result
      ) {
        fs.stat(
          path.join(configuration.GetAppDataDirectory(), 'recent.tar.gz'),
          (stat, things) => console.log(stat, things)
        );
        try {
          let recentContents = fs.readdirSync(path.join(datadir, 'recent'));

          for (let i = 0; i < recentContents.length; i++) {
            const element = recentContents[i];
            if (
              fs.statSync(path.join(datadir, 'recent', element)).isDirectory()
            ) {
              let newcontents = fs.readdirSync(
                path.join(datadir, 'recent', element)
              );

              for (let i = 0; i < newcontents.length; i++) {
                const deeperEle = newcontents[i];
                moveFile.sync(
                  path.join(datadir, 'recent', element, deeperEle),
                  path.join(datadir, element, deeperEle)
                );
              }
            } else {
              moveFile.sync(
                path.join(datadir, 'recent', element),
                path.join(datadir, element)
              );
            }
          }
        } catch (error) {
          console.log('Direct bootstrap');
        }
        if (err) {
          console.log(result.error, err);
          self.context.openErrorModal({ message: 'No Connection' });
        }
        console.log(err, result);
        electron.remote.getGlobal('core').start();
      });

      let prevDownloadPercentArr = [];

      let percentChecker = setInterval(() => {
        if (
          fs.existsSync(
            path.join(configuration.GetAppDataDirectory(), 'recent.tar.gz')
          )
        ) {
          fs.stat(
            path.join(configuration.GetAppDataDirectory(), 'recent.tar.gz'),
            (err, stats) => {
              console.log((stats.size / totalDownloadSize) * 100);
              let sample = (stats.size / totalDownloadSize) * 100;
              prevDownloadPercentArr.push(sample);
              let checkarr = prevDownloadPercentArr.filter(ele => {
                if (ele === self.props.percentDownloaded) {
                  return ele;
                }
              });

              if (checkarr.length > 20 && self.props.percentDownloaded < 100) {
                prevDownloadPercentArr = [];
                console.log('Connection Failure');
                self.props.setPercentDownloaded('Connection Failure');
                clearInterval(percentChecker);
              } else {
                self.props.setPercentDownloaded(
                  (stats.size / totalDownloadSize) * 100
                );
              }
            }
          );
        }

        let checkarr = prevDownloadPercentArr.filter(ele => {
          if (ele === self.props.percentDownloaded) {
            return ele;
          }
        });

        if (checkarr.length > 20 && self.props.percentDownloaded < 100) {
          prevDownloadPercentArr = [];
          console.log('Connection Failure');
          self.props.setPercentDownloaded('Connection Failure');
          clearInterval(percentChecker);
        }
      }, 3000);

      electron.remote.getGlobal('core').on('starting', () => {
        self.CloseBootstrapModalAndSaveSettings();
        clearInterval(percentChecker);
        self.props.setPercentDownloaded(0);
        self.CloseBootstrapModalAndSaveSettings();
        let tarGzLocation = path.join(
          this.GetAppDataDirectory(),
          'recent.tar.gz'
        );
        if (fs.existsSync(tarGzLocation)) {
          fs.unlink(tarGzLocation, err => {
            if (err) throw err;
            console.log('recent.tar.gz was deleted');
          });
        }
      });
    });
};