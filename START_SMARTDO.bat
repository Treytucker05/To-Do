@echo off
setlocal

set PORT=3002
set URL=http://localhost:%PORT%/

REM Change to the folder this script lives in
cd /d "%~dp0"

echo Starting SmartDo dev server on %URL% ...
echo If the server window shows a port-in-use error, free port %PORT% and run this script again.

start "SmartDo Dev Server" cmd /k "npm run dev"

REM Give the server a moment to boot, then open the app
timeout /t 5 /nobreak >nul
start "" %URL%

echo Browser launched to %URL%
echo The server runs in the window titled SmartDo Dev Server. Close THAT window to stop the app.
pause
endlocal
