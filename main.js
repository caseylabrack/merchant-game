const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600, title: "what"})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.hide()
  win.on('ready-to-show', () => win.show())

  // const appMenu = Menu.buildFromTemplate(appMenuTemplate)
  // Menu.setApplicationMenu(appMenu)
}

const appMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit()
        }
      }
    ]
  }
]

app.on('ready', createWindow)
