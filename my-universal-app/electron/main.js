const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:8081';
        win.loadURL(devUrl);
        win.webContents.openDevTools({ mode: 'detach' });
    } else {
        win.loadFile(path.join(__dirname, 'web-dist', 'index.html'));
    }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.handle('ping', () => 'pong from electron');
