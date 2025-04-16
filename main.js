const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron'); // Added Menu and dialog

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

    mainWindow.webContents.openDevTools(); // Open developer tools

    const menu = Menu.buildFromTemplate([
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Contact Information',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Contact Information',
                            message: 'Innovative Communications Inc.\nsupport@splicemaster360.com\nwww.splicemaster360.com',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Ctrl+Shift+I',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.toggleDevTools();
                        }
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    mainWindow.maximize(); // Maximizes the window without fullscreen
    mainWindow.loadFile("public/index.html");
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

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
