import { app, Menu, shell, BrowserWindow, remote } from "electron";

import * as RPC from "./script/rpc";
import { callbackify } from "util";

export default class MenuBuilder {
  mainWindow: remote.BrowserWindow;

  constructor(mainWindow: remote.BrowserWindow) {
    this.mainWindow = remote.getCurrentWindow();
  }

  buildMenu(self) {
    let template;

    if (process.platform === "darwin") {
      template = this.buildDarwinTemplate(self);
    } else {
      template = this.buildDefaultTemplate(self);
    }

    const menu = remote.Menu.buildFromTemplate(template);
    remote.Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    remote.getCurrentWindow().openDevTools();

    this.mainWindow.webContents.on("context-menu", (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  buildDarwinTemplate(self) {
    const subMenuAbout = {
      label: "File",
      submenu: [
        {
          label: "Key Management",
          click: () => {
            if (self.props.unlocked_until !== undefined) {
              self.props.history.push("/Settings/Security");
            } else {
              self.props.history.push("/Settings/Unencrypted");
            }
          }
        },
        {
          label: "Back-up Wallet",
          click: () => {
            let now = new Date()
              .toString()
              .slice(0, 24)
              .split(" ")
              .reduce((a, b) => {
                return a + "_" + b;
              });
            let BackupDir = process.env.HOME + "/NexusBackups";
            if (process.platform === "win32") {
              BackupDir = app.getPath("documents") + "/NexusBackups";
              BackupDir = BackupDir.replace(/\\/g, "/");
            }
            let fs = require("fs");
            let ifBackupDirExists = fs.existsSync(BackupDir);
            if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
              fs.mkdirSync(BackupDir);
            }
            RPC.PROMISE("backupwallet", [
              BackupDir + "/NexusBackup_" + now + ".dat"
            ]);
          }
        },
        {
          label: "View Backups",
          click() {
            let fs = require("fs");
            let BackupDir = process.env.HOME + "/NexusBackups";
            console.log(process.env);
            if (process.platform === "win32") {
              BackupDir = process.env.USERPROFILE + "/NexusBackups";
              BackupDir = BackupDir.replace(/\\/g, "/");
            }
            let ifBackupDirExists = fs.existsSync(BackupDir);
            if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
              fs.mkdirSync(BackupDir);
            }
            let didopen = shell.openItem(BackupDir);
          }
        },
        {
          label: "Send To Tray",
          click() {
            remote.getCurrentWindow().hide();
          }
        },
        {
          label: "Close Window Keep Daemon",
          click() {
            var keepDaemon = true;
            remote.getCurrentWindow().close();
          }
        },
        {
          label: "Quit Nexus Wallet",
          click() {
            RPC.PROMISE("stop", []).then(payload => {
              setTimeout(() => {
                remote.getCurrentWindow().close();
              }, 1000);
            });
          }
        },
        { type: "separator" },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          role: "copy"
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          role: "paste"
        }
      ]
    };
    const subMenuView = {
      label: "Settings",
      submenu: [
        {
          label: "Core Settings",
          click() {
            self.props.history.push("/Settings/Core");
          }
        },
        {
          label: "Application Settings",
          click() {
            self.props.history.push("/Settings/App");
          }
        },
        {
          label: "Key Management Settings",
          click() {
            if (self.props.unlocked_until !== undefined) {
              self.props.history.push("/Settings/Security");
            } else {
              self.props.history.push("/Settings/Unencrypted");
            }
          }
        },
        {
          label: "Style Settings",
          click() {
            self.props.history.push("/Settings/Style");
          }
        },

        //TODO: take this out before 1.0
        {
          label: "Toggle Developer Tools",
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };

    const subMenuWindow = {
      label: "View",
      submenu:
        process.env.NODE_ENV === "development"
          ? [
              {
                label: "Reload",
                accelerator: "Command+R",
                click: () => {
                  this.mainWindow.webContents.reload();
                }
              },

              {
                label: "Toggle Full Screen",
                accelerator: "F11",
                click: () => {
                  remote
                    .getCurrentWindow()
                    .setFullScreen(!remote.getCurrentWindow().isFullScreen());
                }
              }
            ]
          : [
              {
                label: "Toggle Full Screen",
                accelerator: "F11",
                click: () => {
                  remote
                    .getCurrentWindow()
                    .setFullScreen(!remote.getCurrentWindow().isFullScreen());
                }
              }
            ]
    };
    const subMenuHelp = {
      label: "Help",
      submenu: [
        {
          label: "About Nexus",
          click() {
            self.props.history.push("/About");
          }
        },
        {
          label: "NexusEarth",
          click() {
            shell.openExternal("http://nexusearth.com");
          }
        },
        {
          label: "Nexusoft Github",
          click() {
            shell.openExternal("http://github.com/Nexusoft");
          }
        }
      ]
    };

    return [subMenuAbout, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate(self) {
    const templateDefault = [
      {
        label: "&File",
        submenu: [
          {
            label: "Key Management",
            click: () => {
              if (self.props.unlocked_until !== undefined) {
                self.props.history.push("/Settings/Security");
              } else {
                self.props.history.push("/Settings/Unencrypted");
              }
            }
          },
          {
            label: "Back-up Wallet",
            click: () => {
              let now = new Date()
                .toString()
                .slice(0, 24)
                .split(" ")
                .reduce((a, b) => {
                  return a + "_" + b;
                });
              let BackupDir = process.env.HOME + "/NexusBackups";
              if (process.platform === "win32") {
                BackupDir = process.env.USERPROFILE + "/NexusBackups";
                BackupDir = BackupDir.replace(/\\/g, "/");
              }
              let fs = require("fs");
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              RPC.PROMISE("backupwallet", [
                BackupDir + "/NexusBackup_" + now + ".dat"
              ]).then(self.props.OpenModal("Wallet Backup"));
            }
          },
          {
            label: "View Backups",
            click() {
              let fs = require("fs");
              let BackupDir = process.env.HOME + "/NexusBackups";
              if (process.platform === "win32") {
                BackupDir = process.env.USERPROFILE + "/NexusBackups";
                BackupDir = BackupDir.replace(/\\/g, "/");
              }
              let ifBackupDirExists = fs.existsSync(BackupDir);
              if (
                ifBackupDirExists == undefined ||
                ifBackupDirExists == false
              ) {
                fs.mkdirSync(BackupDir);
              }
              let didopen = shell.openItem(BackupDir);
            }
          },
          {
            label: "Send To Tray",
            click() {
              remote.getCurrentWindow().hide();
            }
          },
          {
            label: "Close Window Keep Daemon",
            click() {
              var keepDaemon = true;
              remote.getCurrentWindow().close();
            }
          },
          {
            label: "Quit Nexus Wallet",
            click() {
              RPC.PROMISE("stop", []).then(payload => {
                setTimeout(() => {
                  remote.getCurrentWindow().close();
                }, 1000);
              });
            }
          }
        ]
      },
      {
        label: "Settings",
        submenu: [
          {
            label: "Core Settings",
            click() {
              self.props.history.push("/Settings/Core");
            }
          },
          {
            label: "Application Settings",
            click() {
              self.props.history.push("/Settings/App");
            }
          },
          {
            label: "Key Management Settings",
            click() {
              if (self.props.unlocked_until !== undefined) {
                self.props.history.push("/Settings/Security");
              } else {
                self.props.history.push("/Settings/Unencrypted");
              }
            }
          },
          {
            label: "Style Settings",
            click() {
              self.props.history.push("/Settings/Style");
            }
          },
          {
            label: "Toggle &Developer Tools",
            accelerator: "Alt+Ctrl+I",
            click: () => {
              this.mainWindow.toggleDevTools();
            }
          }
        ]
      },
      {
        label: "&View",
        submenu:
          process.env.NODE_ENV === "development"
            ? [
                {
                  label: "Reload",
                  accelerator: "Ctrl+R",
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },

                {
                  label: "Toggle Full Screen",
                  accelerator: "F11",
                  click: () => {
                    remote
                      .getCurrentWindow()
                      .setFullScreen(!remote.getCurrentWindow().isFullScreen());
                  }
                },
                {
                  label: "Toggle &Developer Tools",
                  accelerator: "Alt+Ctrl+I",
                  click: () => {
                    this.mainWindow.toggleDevTools();
                  }
                }
              ]
            : [
                {
                  label: "Toggle Full Screen",
                  accelerator: "F11",
                  click: () => {
                    remote
                      .getCurrentWindow()
                      .setFullScreen(!remote.getCurrentWindow().isFullScreen());
                  }
                }
              ]
      },
      {
        label: "Help",
        submenu: [
          {
            label: "About Nexus",
            click() {
              self.props.history.push("/About");
            }
          },
          {
            label: "NexusEarth",
            click() {
              shell.openExternal("http://nexusearth.com");
            }
          },
          {
            label: "Nexusoft Github",
            click() {
              shell.openExternal("http://github.com/Nexusoft");
            }
          }
        ]
      }
    ];

    return templateDefault;
  }
}
