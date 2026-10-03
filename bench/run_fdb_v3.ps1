# ==============================================================================
# run_fdb_v3.ps1 — Windows PowerShell Wrapper for FDB-v3 Benchmark
# ==============================================================================

[CmdletBinding()]
param (
    [int]$Limit = 0,
    [switch]$NoLlmJudge,
    [string]$Provider = "kaizen",
    [string]$Latency = "instant",
    [switch]$Force,
    [switch]$AsrOnly,
    [switch]$UseWsl,
    [Alias("h")]
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\bench\run_fdb_v3.ps1 [-Limit <int>] [-NoLlmJudge] [-Provider <string>] [-Latency <string>] [-Force] [-AsrOnly] [-UseWsl]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Limit <int>         Run only first N scenarios (e.g. -Limit 3 for smoke test)"
    Write-Host "  -NoLlmJudge          Skip GPT-4o semantic judge, use exact matching"
    Write-Host "  -Provider <string>   Agent provider (default: kaizen)"
    Write-Host "  -Latency <string>    API latency profile: instant|realistic|high_jitter (default: instant)"
    Write-Host "  -Force               Overwrite existing inference results"
    Write-Host "  -AsrOnly             Run ASR and evaluation only"
    Write-Host "  -UseWsl              Force execution inside WSL instead of Git Bash"
    exit 0
}

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "🏛️  KAIZEN FDB-v3 Benchmark Reproduction (Windows PowerShell)" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# Check if WSL is requested or available
$HasWsl = (Get-Command wsl -ErrorAction SilentlyContinue) -ne $null
$HasBash = (Get-Command bash -ErrorAction SilentlyContinue) -ne $null

if ($UseWsl -or ($HasWsl -and -not $HasBash)) {
    Write-Host "Invoking benchmark reproduction inside WSL..." -ForegroundColor Yellow
    # Convert Windows path to wslpath
    $WslScriptPath = wsl wslpath -a ($BashScript -replace '\\', '/')
    $WslArgs = $ArgsList -join " "
    wsl bash $WslScriptPath $ArgsList
} elseif ($HasBash) {
    Write-Host "Invoking benchmark reproduction via bash..." -ForegroundColor Yellow
    bash $BashScript @ArgsList
} else {
    Write-Error "Neither bash nor WSL found. Please install Git Bash or WSL to execute benchmark reproduction."
}
