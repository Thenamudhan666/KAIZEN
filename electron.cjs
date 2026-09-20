const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

// Suppress GPU disk cache errors on Windows
app.commandLine.appendSwitch('disable-gpu-cache');
app.commandLine.appendSwitch('disable-http-cache');

// Clean up stale cache directories to avoid Windows EPERM / access denied errors
try {
  const userData = path.join(process.env.APPDATA || '', 'jarvis-ai-partner');
  for (const sub of ['GPUCache', 'DawnGraphiteCache', 'DawnWebGPUCache']) {
    const p = path.join(userData, sub);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  }
} catch (_) {}

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3000;

function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${SERVER_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer() {
  return new Promise(async (resolve, reject) => {
    // Check if server is already running (e.g. started by concurrently in dev)
    const alreadyRunning = await checkServerRunning();
    if (alreadyRunning) {
      console.log('[JARVIS] Server already running on port', SERVER_PORT, '- skipping spawn');
      resolve();
      return;
    }

    const isPackaged = app.isPackaged;
    let proc;

    if (isPackaged) {
      // In production, run the bundled server.cjs
      proc = spawn(process.execPath, [path.join(__dirname, 'dist', 'server.cjs')], {
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'production' },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } else {
      // In dev without concurrently, use npx tsx to run server.ts directly
      proc = spawn('npx', ['tsx', 'server.ts'], {
        cwd: __dirname,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });
    }

    serverProcess = proc;

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Server]', output);
      if (output.includes('Server listening')) {
        resolve();
      }
    });

    proc.stderr.on('data', (data) => {
      console.error('[Server Error]', data.toString());
    });

    proc.on('error', (err) => {
      console.error('[Server Process Error]', err);
      reject(err);
    });

    proc.on('exit', (code) => {
      console.log(`[Server] Process exited with code ${code}`);
    });

    // Fallback resolve after 8 seconds if server doesn't log the expected message
    setTimeout(() => resolve(), 8000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#050505',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  // Load the app from the local Express server
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for custom title bar window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Grant microphone and audio permissions automatically
function setupPermissions() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'audioCapture', 'microphone'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Also handle permission checks (Chromium 97+)
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'audioCapture', 'microphone'];
    return allowedPermissions.includes(permission);
  });
}

app.whenReady().then(async () => {
  setupPermissions();

  console.log('[JARVIS] Starting Express server...');
  try {
    await startServer();
    console.log('[JARVIS] Server started. Creating window...');
  } catch (err) {
    console.error('[JARVIS] Failed to start server, launching anyway:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill the server process
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
