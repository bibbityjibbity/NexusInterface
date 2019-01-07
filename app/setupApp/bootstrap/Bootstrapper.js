// External
import checkDiskSpace from 'check-disk-space';
import fs from 'fs';
import path from 'path';
import https from 'https';
import electron from 'electron';
import tarball from 'tarball-extract';
import moveFile from 'move-file';

// Internal
import * as RPC from 'scripts/rpc';
import configuration from 'api/configuration';
import { normalizePath } from 'utils';

const recentDbUrl =
  'https://nexusearth.com/bootstrap/LLD-Database/recent.tar.gz';

const defaultHomeDir =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
const defaultBackupDir = normalizePath(defaultHomeDir + '/NexusBackups');

// Recent database download location
const fileLocation = path.join(
  configuration.GetAppDataDirectory(),
  'recent.tar.gz'
);
const dataDir = configuration.GetCoreDataDir();
const extractDest = path.join(dataDir, 'recent');

export default class Bootstrapper {
  /**
   * PRIVATE PROPERTIES
   */
  _onProgress = null;
  _onAbort = null;
  _onError = null;
  _onFinish = null;

  _aborted = false;

  /**
   * PUBLIC METHODS
   */
  static async checkFreeSpace() {
    const diskSpace = await checkDiskSpace(configuration.GetCoreDataDir());
    return diskSpace.free >= 20000000000; // 20GB
  }

  async start({ backupFolder, clearOverviewVariables }) {
    try {
      this._onProgress && this._onProgress('backing_up');
      await this._backupWallet(backupFolder);
      if (this._aborted) return;

      this._onProgress && this._onProgress('stopping_core');
      await electron.remote.getGlobal('core').stop();
      if (this._aborted) return;

      clearOverviewVariables();
      // Remove the old file if exists
      if (fs.existsSync(fileLocation)) {
        fs.unlinkSync(fileLocation, err => {
          if (err) throw err;
        });
      }

      this._onProgress && this._onProgress('downloading', {});
      await this._downloadCompressedDb();
      if (this._aborted) return;

      this._onProgress && this._onProgress('extracting');
      await this._extractDb();
      if (this._aborted) return;

      this._onProgress && this._onProgress('finalizing');
      await this._moveExtractedContent();

      this._cleanUp();

      this._onFinish && this._onFinish();
    } catch (err) {
      this._onError && this._onError(err);
    } finally {
      electron.remote.getGlobal('core').start();
    }
  }

  registerEvents(events) {
    this._onProgress = events.onProgress || this._onProgress;
    this._onAbort = events.onAbort || this._onAbort;
    this._onError = events.onError || this._onError;
    this._onFinish = events.onFinish || this._onFinish;
  }

  abort() {
    this._aborted = true;
    if (this.request) this.request.abort();
    this._onAbort && this._onAbort();
  }

  /**
   * PRIVATE METHODS
   */
  async _backupWallet(backupFolder) {
    const backupDir = backupFolder || defaultBackupDir;
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const now = new Date()
      .toString()
      .slice(0, 24)
      .split(' ')
      .reduce((a, b) => {
        return a + '_' + b;
      })
      .replace(/:/g, '_');
    await RPC.PROMISE('backupwallet', [
      backupDir + '/NexusBackup_' + now + '.dat',
    ]);
  }

  async _downloadCompressedDb() {
    const promise = new Promise((resolve, reject) => {
      const file = fs.createWriteStream(fileLocation);
      this.request = https
        .get(recentDbUrl)
        .setTimeout(60000)
        .on('response', response => {
          const totalSize = parseInt(response.headers['content-length'], 10);
          let downloaded = 0;

          response.on('data', chunk => {
            downloaded += chunk.length;
            this._onProgress &&
              this._onProgress('downloading', { downloaded, totalSize });
          });

          response.pipe(file);
          file.on('finish', function() {
            file.close(resolve);
          });
        })
        .on('error', reject)
        .on('timeout', function() {
          this.request.abort();
          reject(new Error('Request timeout!'));
        })
        .on('abort', function() {
          if (fs.existsSync(fileLocation)) {
            fs.unlink(fileLocation, err => {
              console.error(err);
            });
          }
          resolve();
        });
    });

    // Ensure this.request is always cleaned up
    try {
      return await promise;
    } finally {
      this.request = null;
    }
  }

  async _extractDb() {
    return new Promise((resolve, reject) => {
      tarball.extractTarball(fileLocation, extractDest, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async _moveExtractedContent() {
    const recentContents = fs.readdirSync(extractDest);
    for (let element of recentContents) {
      if (fs.statSync(path.join(extractDest, element)).isDirectory()) {
        const newcontents = fs.readdirSync(path.join(extractDest, element));
        for (let deeperEle of newcontents) {
          moveFile.sync(
            path.join(extractDest, element, deeperEle),
            path.join(dataDir, element, deeperEle)
          );
        }
      } else {
        moveFile.sync(
          path.join(extractDest, element),
          path.join(dataDir, element)
        );
      }
    }
  }

  _cleanUp() {
    // Clean up asynchornously
    setTimeout(() => {
      if (fs.existsSync(fileLocation)) {
        fs.unlink(fileLocation, err => {
          console.error(err);
        });
      }

      if (fs.existsSync(extractDest)) {
        const recentContents = fs.readdirSync(extractDest);
        recentContents
          .filter(child =>
            fs.statSync(path.join(extractDest, child)).isDirectory()
          )
          .forEach(subFolder => fs.rmdirSync(subFolder));
        fs.rmdirSync(extractDest);
      }
    }, 0);
  }
}
