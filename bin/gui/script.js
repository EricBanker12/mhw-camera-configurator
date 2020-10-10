const path = require('path')
const fs = require('fs')
const Jszip = require('jszip')
const electron = require('electron').remote

const defaults = {
    close: {
        height: -14,
        zoom: 70
    },
    far: {
        height: 5,
        zoom: -50
    }
}

const offsets = {
    close: {
        height: 0x00001C5C,
        zoom: 0x00001C60
    },
    far: {
        height: 0x00001C80,
        zoom: 0x00001C84
    }
}

let config
let data
let ready
let saved

// read values
fs.readFile(path.join(__dirname, 'assets', 'blob'), {encoding: 'utf-8'}, dataToConfig)


document.addEventListener('DOMContentLoaded', function() {
    ready = true
    // add event listeners
    // external links
    document.getElementsByTagName('body')[0].addEventListener('click', linkHandler)
    // input
    for (let input of document.getElementsByTagName('input')) {
        input.addEventListener('ValueChange', updateConfig)
    }
    // reset
    for (let resetButton of document.getElementsByClassName('reset')) {
        resetButton.addEventListener('click', loadDefault)
    }
    // reset all
    document.getElementById('resetAll').addEventListener('click', loadAllDefaults)
    // export .zip
    document.getElementById('export').addEventListener('click', exportZip)
})

function linkHandler(event) {
    // open links in external, default browser
    if (event.target.tagName == 'A') {
        event.preventDefault()
        electron.shell.openExternal(event.target.href)
    }
}

function loadConfig() {
    document.getElementById('close-height').value = config.close.height
    document.getElementById('close-zoom').value = config.close.zoom
    document.getElementById('far-height').value = config.far.height
    document.getElementById('far-zoom').value = config.far.zoom
}

function updateConfig() {
    config.close.height = document.getElementById('close-height').value
    config.close.zoom = document.getElementById('close-zoom').value
    config.far.height = document.getElementById('far-height').value
    config.far.zoom = document.getElementById('far-zoom').value
    saved = false
}

function saveConfig() {
    updateConfig()
    configToData()
}

function exportZip() {
    if (!saved) saveConfig()
    electron.dialog.showSaveDialog({
        title: 'Export MHW Camera Config as .zip',
        defaultPath: path.join(__dirname,'camera-zoom'),
        filters: [
            {name: 'Archive', extensions: ['zip']},
            {name: 'All Files', extensions: ['*']}
        ]
    })
    .then(obj => {
        if (obj.filePath) {
            let zip = new Jszip()
            zip.file(path.join('nativePC', 'common', 'camera', 'setting_basic.cms'), data)
            zip.generateNodeStream({type:'nodebuffer',streamFiles:true,compression:'DEFLATE',compressionOptions:{level:1}}).pipe(fs.createWriteStream(obj.filePath))
        }
    })
}

function loadDefault(event) {
    let target = event.currentTarget.id.replace('reset-','').split('-')
    document.getElementById(target[0] + '-' + target[1]).value = defaults[target[0]][target[1]]
}

function loadAllDefaults() {
    document.getElementById('close-height').value = defaults.close.height
    document.getElementById('close-zoom').value = defaults.close.zoom
    document.getElementById('far-height').value = defaults.far.height
    document.getElementById('far-zoom').value = defaults.far.zoom
    saveConfig()
}

function dataToConfig(err, dataStr) {
    if (err) throw err
    data = Buffer.from(dataStr, 'base64')
    config = {
        close: {
            height: data.readFloatLE(offsets.close.height),
            zoom: data.readFloatLE(offsets.close.zoom)
        },
        far: {
            height: data.readFloatLE(offsets.far.height),
            zoom: data.readFloatLE(offsets.far.zoom)
        }
    }
    // load previous settings from ".../AppData/roaming/MHW Camera Configurator/config.json"
    if (fs.existsSync(path.join(electron.app.getPath('userData'),'config.json'))) {
        const oldConfig = JSON.parse(fs.readFileSync(path.join(electron.app.getPath('userData'),'config.json'),{encoding:'utf-8'}))
        config.close = oldConfig.close || config.close
        config.far = oldConfig.far || config.far
    }
    if (ready) loadConfig()
    else document.addEventListener('DOMContentLoaded', loadConfig)
}

function configToData() {
    //close
    data.writeFloatLE(config.close.height, offsets.close.height)
    data.writeFloatLE(config.close.zoom, offsets.close.zoom)
    // far
    data.writeFloatLE(config.far.height, offsets.far.height)
    data.writeFloatLE(config.far.zoom, offsets.far.zoom)
    //console.log(electron.app.getPath('userData'))
    fs.writeFileSync(path.join(electron.app.getPath('userData'),'config.json'),JSON.stringify(config,null,'    '),{encoding:'utf-8'})
    saved = true
}