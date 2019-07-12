const electron = require('electron')
const path = require('path')

const {app, BrowserWindow} = electron

let mainWindow

// on ready
app.on('ready', function(){
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        width: width < 480 ? width : 480,
        height: height < 680 ? height - 30 : 650,
        icon: path.join(__dirname, 'scripts', 'cat-camera.ico'),
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    mainWindow.removeMenu()
})