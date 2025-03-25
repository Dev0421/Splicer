const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow; // Declare globally so it’s accessible everywhere

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.maximize(); // Maximizes the window without fullscreen

    mainWindow.loadFile("public/index.html");

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

// Listen for navigation requests
ipcMain.on('navigate-to-page', (event, page) => {
    if (mainWindow) {
        mainWindow.loadFile(`public/${page}`); // Ensure correct path
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
