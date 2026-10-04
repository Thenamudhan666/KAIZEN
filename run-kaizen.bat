@echo off
title KAIZEN AI Partner
cd /d "%~dp0"
echo ==========================================================
echo [KAIZEN] FULL-STACK LAUNCHER (ELECTRON + LIVEKIT + AGENT)
echo ==========================================================
powershell -ExecutionPolicy Bypass -File .\start-kaizen.ps1 run
