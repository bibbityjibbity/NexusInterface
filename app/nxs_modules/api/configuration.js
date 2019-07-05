//////////////////////////////////////////////////////
//
// Configuration Manager
//
//////////////////////////////////////////////////////

// External
import fs from 'fs';
import path from 'path';
import electron from 'electron';
/**
 *  Configuration Class
 *
 **/
const configuration = {
  /**
   * Check To see if this file excists in the App Data Directory
   *
   * @param {string} filename File Name plus extention
   * @returns {boolean} If exsits or not
   */
  Exists(filename) {
    try {
      fs.accessSync(path.join(configuration.GetAppDataDirectory(), filename));
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Reads a file then returns the contents, has a catch but use Exists method first
   *
   * @param {string} filename File Name plus extention
   * @returns {object}
   */
  Read(filename) {
    try {
      return fs.readFileSync(
        path.join(configuration.GetAppDataDirectory(), filename)
      );
    } catch (err) {
      console.log('Error reading file: ' + filename + ' => ' + err);

      return undefined;
    }
  },

  /**
   * Read a json configuration file and return a json object
   *
   * @param {string} filename File name plus extention
   * @returns {object}
   */
  ReadJson(filename) {
    // TODO: Is utf-8 required here?
    var json = configuration.Read(filename);
    if (!json) return {};
    return JSON.parse(json);
  },

  /**
   * Update a configuration file with provided content
   *
   * @param {string} filename File name plus extention
   * @param {object} content Object to write
   * @returns {boolean} Did write succeed
   */
  Write(filename, content) {
    try {
      fs.writeFileSync(
        path.join(configuration.GetAppDataDirectory(), filename),
        content
      );

      return true;
    } catch (err) {
      console.log('Error writing file: ' + filename + ' => ' + err);

      return false;
    }
  },

  /**
   * Update a json configuration file with provided json object
   *
   * @param {string} filename File name
   * @param {json} json Json object to write
   * @returns  {boolean} Did write succeed
   */
  WriteJson(filename, json) {
    // TODO: Is utf-8 required here?
    return configuration.Write(filename, JSON.stringify(json, null, 2)); // pretty print the json so it is human readable
  },

  /**
   * Delete the configuration file
   *
   * @param {string} filename File Name
   * @returns {boolean} Did succeed
   */
  Delete(filename) {
    try {
      fs.unlink(path.join(configuration.GetAppDataDirectory(), filename));

      return true;
    } catch (err) {
      console.log('Error deleting file: ' + filename + ' => ' + err);

      return false;
    }
  },

  /**
   * Rename a configuration file
   *
   * @param {string} oldFilename Old file name
   * @param {string} newFilename New file name
   * @returns {boolean} did succeed
   */
  Rename(oldFilename, newFilename) {
    try {
      fs.renameSync(
        path.join(configuration.GetAppDataDirectory(), oldFilename),
        path.join(configuration.GetAppDataDirectory(), newFilename)
      );

      return true;
    } catch (err) {
      console.log('Error renaming file: ' + filename + ' => ' + err);

      return false;
    }
  },

  /**
   * Usesd on the start of the app to make the necessary directories
   *
   */
  Start() {
    if (!fs.existsSync(configuration.GetAppDataDirectory())) {
      fs.mkdirSync(configuration.GetAppDataDirectory());
    }

    if (!fs.existsSync(configuration.GetAssetsDir())) {
      fs.mkdirSync(configuration.GetAssetsDir());
    }
  },

  /**
   * Get the application data directory
   *
   * @returns {string} the path to the application data directory
   */
  GetAppDataDirectory() {
    const app = electron.app || electron.remote.app;
    let AppDataDirPath = '';

    if (process.platform === 'darwin') {
      AppDataDirPath = path.join(
        app
          .getPath('appData')
          .replace(' ', `\ `)
          .replace('/Electron/', ''),
        'Nexus_Wallet'
      );
    } else {
      AppDataDirPath = path.join(
        app.getPath('appData').replace('/Electron/', ''),
        'Nexus_Wallet'
      );
    }

    return AppDataDirPath;
  },

  /**
   * Returns the core data directory path
   *
   * @returns {string} Core Data Directory Path
   */
  GetCoreDataDir() {
    const app = electron.app || electron.remote.app;
    var datadir = '';

    //Set data directory by OS for automatic daemon mode
    if (process.platform === 'win32') {
      var datadir = process.env.APPDATA + '\\Nexus';
    } else if (process.platform === 'darwin') {
      var datadir = path.join(
        app
          .getPath('appData')
          .replace(' ', `\ `)
          .replace('/Electron/', ''),
        'Nexus'
      );
    } else {
      var datadir = process.env.HOME + '/.Nexus';
    }
    return datadir;
  },

  /**
   * Returns the Application Resources Directory path
   *
   * @returns {string} Applicaion Resources Directory Path
   */
  GetAssetsDir() {
    const app = electron.app != undefined ? electron.app : electron.remote.app;
    const basePath =
      process.env.NODE_ENV === 'development'
        ? process.cwd()
        : process.platform === 'darwin'
        ? path.resolve(app.getPath('exe'), '..', '..', 'Resources')
        : path.resolve(app.getPath('exe'), '..', 'resources');
    return path.join(basePath, 'assets');
  },

  /**
   * Returns the user's home directory
   *
   * @returns {string} User's home directory
   */
  GetHomeDir() {
    if (process.platform === 'win32') {
      return process.env.USERPROFILE;
    } else {
      return process.env.HOME;
    }
  },

  GetModulesDir() {
    return path.join(configuration.GetAppDataDirectory(), 'modules');
  },
};

configuration.Start();

export default configuration;
