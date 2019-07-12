const electron = require('electron')
const path = require('path')

const {app, BrowserWindow} = electron

let mainWindow

// on ready
app.on('ready', function(){
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        show: false,
        width: width < 480 ? width : 480,
        height: height < 680 ? height - 30 : 650,
        icon: path.join(__dirname, 'gui/assets/icon.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.once('ready-to-show', function(){mainWindow.show()})
    mainWindow.loadURL(`file://${__dirname}/gui/index.html`)
    mainWindow.removeMenu()
})