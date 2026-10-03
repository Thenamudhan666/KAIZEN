# start-kaizen.ps1 — Full-Stack Launcher for KAIZEN in Electron

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🏛️  KAIZEN FULL-STACK LAUNCHER (ELECTRON + LIVEKIT + AGENT)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Clean stale ports (3000, 24678, orphaned electron)
Write-Host "`n🧹 [1/4] Cleaning stale ports..." -ForegroundColor Yellow
node scripts/clean-ports.cjs

# 2. Start LiveKit Server if not already running on port 7880
Write-Host "`n📡 [2/4] Checking LiveKit Server on port 7880..." -ForegroundColor Yellow
$lkRunning = Get-NetTCPConnection -LocalPort 7880 -ErrorAction SilentlyContinue
if (-not $lkRunning) {
    if (Test-Path ".\bin\livekit-server.exe") {
        Write-Host "  Starting local LiveKit Server (bin/livekit-server.exe --dev)..." -ForegroundColor Green
        Start-Process -FilePath ".\bin\livekit-server.exe" -ArgumentList "--dev" -NoNewWindow
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  LiveKit server binary not found in bin/. Assuming external server." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "  ✓ LiveKit Server is already running on port 7880." -ForegroundColor Green
}

# 3. Start Python Voice Agent in background
Write-Host "`n🤖 [3/4] Launching Python VoicePipelineAgent..." -ForegroundColor Yellow
$pythonExe = ".\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}
$agentProc = Start-Process -FilePath $pythonExe -ArgumentList "agent.py", "dev" -PassThru -NoNewWindow
Start-Sleep -Seconds 2
Write-Host "  ✓ VoicePipelineAgent active with PID $($agentProc.Id)" -ForegroundColor Green

# 4. Launch Electron Desktop Application
Write-Host "`n🖥️  [4/4] Launching Electron Desktop Application..." -ForegroundColor Yellow
try {
    npm run electron:dev
} finally {
    Write-Host "`n🛑 Shutting down background processes..." -ForegroundColor DarkGray
    if ($agentProc -and -not $agentProc.HasExited) {
        Stop-Process -Id $agentProc.Id -Force -ErrorAction SilentlyContinue
    }
    node scripts/clean-ports.cjs
    Write-Host "✓ Cleanup complete." -ForegroundColor Green
}
