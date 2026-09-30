@echo off
rem Wrapper for scripts/submodules.ps1 (pure PowerShell, no Git bash needed).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0submodules.ps1" %*
exit /b %errorlevel%
