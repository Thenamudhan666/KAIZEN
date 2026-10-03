const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const localBin = path.join(process.cwd(), 'bin', isWin ? 'livekit-server.exe' : 'livekit-server');

let cmd = 'livekit-server';
const extraArgs = process.argv.slice(2);
const args = extraArgs.length > 0 ? extraArgs : ['--dev'];

if (fs.existsSync(localBin)) {
  cmd = localBin;
}

console.log(`[KAIZEN LiveKit] Launching LiveKit server: ${cmd} ${args.join(' ')}`);
const child = spawn(cmd, args, { stdio: 'inherit' });

child.on('error', (err) => {
  console.error('[KAIZEN LiveKit] Error launching server:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
