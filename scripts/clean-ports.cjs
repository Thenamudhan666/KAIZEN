const { execSync } = require('child_process');

function killPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const pids = [...new Set(
      output
        .split('\n')
        .map(line => line.trim().split(/\s+/).pop())
        .filter(pid => pid && pid !== '0' && !isNaN(Number(pid)))
    )];
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`[CleanPorts] Freed port ${port} (PID ${pid})`);
      } catch (_) {}
    }
  } catch (_) {
    // Port not in use, nothing to do
  }
}

// Clean ports 3000 (Express/WebSocket) and 24678 (Vite HMR)
killPort(3000);
killPort(24678);

// Clean any orphaned electron processes
try {
  execSync('taskkill /F /IM electron.exe', { stdio: 'ignore' });
} catch (_) {}

