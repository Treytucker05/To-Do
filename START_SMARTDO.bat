@echo off
setlocal

set PORT=3002
set URL=http://localhost:%PORT%/

REM Change to the folder this script lives in
cd /d "%~dp0"

echo Checking port %PORT% ...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
    echo Detected process on port %PORT% (PID %%a). Stopping it...
    taskkill /PID %%a /F >nul 2>&1
)

REM Verify port is now free
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
    echo Port %PORT% is still in use by PID %%a. Free it and rerun this script.
    pause
    exit /b 1
)

echo Starting SmartDo dev server on %URL%
start "SmartDo Dev Server" cmd /k "npm run dev || (echo Dev server exited. Press any key to close & pause)"

REM Give the server a moment to boot, then open the app
timeout /t 3 /nobreak >nul
start "" %URL%

echo Browser launched to %URL%
echo The server runs in the \"SmartDo Dev Server\" window. Close THAT window to stop it.
pause
endlocal
