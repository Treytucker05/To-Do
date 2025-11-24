@echo off
setlocal

set PORT=3002

REM Change to the folder this script lives in
cd /d "%~dp0"

REM Kill any process already using the dev port so Vite won't hop ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Detected process on port %PORT% (PID %%a). Stopping it...
    taskkill /PID %%a /F >nul 2>&1
)

echo Starting SmartDo dev server on http://localhost:%PORT%/ ...
start "SmartDo Dev Server" cmd /k "npm run dev"

REM Give the server a moment to boot, then open the app
timeout /t 3 /nobreak >nul
start "" http://localhost:%PORT%/

echo A new window was opened to run the server. Close it to stop SmartDo.
endlocal
