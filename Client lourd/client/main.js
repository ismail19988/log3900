const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

  
  let win
  
  function createWindow() {
    win = new BrowserWindow({
      height: 600,
      width: 800,
      fullscreenable: true,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: true
      }
    })
    win.maximize();
    win.show();
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, `/dist/client/index.html`),
        protocol: "file:",
        slashes: true
      })
    );
  
    win.on('closed', function () {
        win = null
    })

  }
  
  app.on('ready', createWindow)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })
