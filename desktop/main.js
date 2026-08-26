const { app, BrowserWindow } = require('electron')

function createWindow(){
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#fff8ea',
    webPreferences: { contextIsolation: true }
  })
  win.loadURL('http://127.0.0.1:5173')
}

app.whenReady().then(createWindow)
app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit() })
