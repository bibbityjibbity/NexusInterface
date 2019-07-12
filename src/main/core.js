import spawn from 'cross-spawn';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import { coreDataDir, assetsByPlatformDir } from 'consts/paths';
import { LoadSettings, UpdateSettings } from 'lib/settings';
import { customConfig } from 'lib/coreConfig';
import exec from 'utils/promisified/exec';
import sleep from 'utils/promisified/sleep';

const coreBinaryName = `nexus-${process.platform}-${process.arch}${
  process.platform === 'win32' ? '.exe' : ''
}`;
const coreBinaryPath = path.join(assetsByPlatformDir, 'cores', coreBinaryName);

/**
 * Check if core binary file exists
 *
 * @returns
 */
function coreBinaryExists() {
  log.info('Checking if core binary exists: ' + coreBinaryPath);
  try {
    fs.accessSync(coreBinaryPath);
    log.info('Core binary exists');
    return true;
  } catch (e) {
    log.info('Core binary does not exist: ' + coreBinaryPath);
    return false;
  }
}

/**
 * Load user & password from the nexus.conf file
 *
 * @returns
 */
function loadNexusConf() {
  if (fs.existsSync(path.join(coreDataDir, 'nexus.conf'))) {
    log.info('nexus.conf exists. Importing username and password.');

    const configs = fs
      .readFileSync(path.join(coreDataDir, 'nexus.conf'))
      .toString()
      .split(`\n`);
    const userConfig = configs
      .map(c => /^rpcuser=(.*)/.exec(c.trim()))
      .find(c => c);
    const user = userConfig && userConfig[1];
    const passwordConfig = configs
      .map(c => /^rpcpassword=(.*)/.exec(c.trim()))
      .find(c => c);
    const password = passwordConfig && passwordConfig[1];

    return { user, password };
  } else {
    return {};
  }
}

/**
 * Get Process ID of core process if core is running
 *
 * @returns
 */
async function getCorePID() {
  const modEnv = process.env;
  modEnv.Nexus_Daemon = coreBinaryName;
  let PID;

  if (process.platform == 'win32') {
    PID = await exec(
      `tasklist /NH /v /fi "IMAGENAME eq ${coreBinaryName}" /fo CSV`,
      [],
      { env: modEnv }
    )
      .toString()
      .split(',')[1];
    PID = PID && Number(PID.replace(/"/gm, ''));
  } else if (process.platform == 'darwin') {
    PID = await exec('ps -A', [], {
      env: modEnv,
    })
      .toString()
      .split('\n')
      .find(output => output.includes(coreBinaryPath));

    PID =
      PID &&
      Number(
        PID.trim()
          .split(' ')[0]
          .toString()
          .replace(/^\s+|\s+$/gm, '')
      );
  } else {
    PID = await exec('ps -o pid --no-headers -p 1 -C ${Nexus_Daemon}', [], {
      env: modEnv,
    })
      .toString()
      .split('\n')[1];
    PID =
      PID &&
      Number(
        PID.replace(/^\s*/gm, '')
          .split(' ')[0]
          .toString()
          .replace(/^\s+|\s+$/gm, '')
      );
  }

  if (!PID || Number.isNaN(PID) || PID < 2) {
    return null;
  } else {
    return PID;
  }
}

/**
 *
 *
 * @class Core
 */
class Core {
  /**
   * Start up the core with necessary parameters
   *
   * @memberof Core
   */
  start = async () => {
    const settings = LoadSettings();
    const corePID = await getCorePID();

    if (settings.manualDaemon == true) {
      log.info('Core Manager: Manual daemon mode, skipping starting core');
      throw 'Manual daemon mode';
    }

    if (corePID) {
      log.info(
        'Core Manager: Daemon Process already running. Skipping starting core'
      );
      return null;
    }

    if (!coreBinaryExists()) {
      log.info(
        'Core Manager: Core not found, please run in manual deamon mode'
      );
      throw 'Core not found';
    }

    const conf = (this.config = customConfig({
      ...loadNexusConf(),
      verbose: settings.verboseLevel,
    }));
    if (!fs.existsSync(conf.dataDir)) {
      log.info(
        'Core Manager: Data Directory path not found. Creating folder: ' +
          conf.dataDir
      );
      fs.mkdirSync(conf.dataDir);
    }

    if (!fs.existsSync(path.join(conf.dataDir, 'nexus.conf'))) {
      fs.writeFileSync(
        path.join(conf.dataDir, 'nexus.conf'),
        `rpcuser=${conf.user}\nrpcpassword=${conf.password}\n`
      );
    }

    const params = [
      '-daemon',
      '-avatar',
      '-server',
      '-rpcthreads=4',
      '-fastsync',
      `-datadir=${conf.dataDir}`,
      `-rpcallowip=${conf.ip}`,
      `-rpcport=${conf.port}`,
      `-verbose=${conf.verbose}`,
      // //
      // '-testnet',
      // '-manager=false',
      // '-connect=192.168.0.234',
      // //
    ];
    if (settings.forkBlocks) {
      params.push('-forkblocks=' + settings.forkBlocks);
      UpdateSettings({ forkBlocks: 0 });
    }
    // Enable mining (default is 0)
    if (settings.enableMining == true) {
      params.push('-mining=1');
    }
    // Enable staking (default is 0)
    if (settings.enableStaking == true) params.push('-stake=1');
    // params.push('-llpallowip=127.0.0.1:9325'); // TODO: llp white list

    log.info('Core Parameters: ' + params.toString());
    log.info('Core Manager: Starting core');
    const coreProcess = spawn(coreBinaryPath, params, {
      shell: false,
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    if (coreProcess) {
      log.info(
        `Core Manager: Core has started (process id: ${coreProcess.pid})`
      );

      return coreProcess.pid;
    } else {
      throw 'Core failed to start';
    }
  };

  /**
   * Stop the core from running by sending stop command or SIGTERM to the process
   *
   * @memberof Core
   */
  stop = async () => {
    log.info('Core Manager: Stop function called');
    const settings = LoadSettings();

    if (settings.manualDaemon) {
      this.config = customConfig({
        ip: settings.manualDaemonIP,
        port: settings.manualDaemonPort,
        user: settings.manualDaemonUser,
        password: settings.manualDaemonPassword,
        dataDir: settings.manualDaemonDataDir,
      });
    }
    const conf = this.config;

    await axios.post(
      conf.host,
      { method: 'stop', params: [] },
      {
        auth:
          conf.user && conf.password
            ? {
                username: conf.user,
                password: conf.password,
              }
            : undefined,
      }
    );

    // Check if the core really stopped
    let corePID;
    for (let i = 0; i < 30; i++) {
      corePID = await getCorePID();

      if (corePID) {
        log.info(
          `Core Manager: Core still running after stop command for: ${i} seconds, CorePID: ${corePID}`
        );
      } else {
        log.info(`Core Manager: Core stopped gracefully.`);
        return true;
      }
      await sleep(1000);
    }

    // If core still doesn't stop after 30 seconds, kill the process
    log.info('Core Manager: Killing process ' + corePID);
    const { env } = process;
    env.KILL_PID = corePID;
    if (process.platform == 'win32') {
      await exec(`taskkill /F /PID ${corePID}`, [], { env });
    } else {
      await exec('kill -9 $KILL_PID', [], { env });
    }
    return false;
  };

  /**
   * Restart the core process
   *
   * @memberof Core
   */
  restart = async () => {
    await stopCore();
    await startCore();
  };
}

export default new Core();
