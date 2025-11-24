@echo off
setlocal

REM Change to the folder this script lives in
cd /d "%~dp0"

echo Starting SmartDo dev server on http://localhost:3002/ ...
REM Run Vite in a new window so the server keeps running
start "SmartDo Dev Server" cmd /k "npm run dev"

REM Give the server a moment to boot, then open the app
timeout /t 2 /nobreak >nul
start "" http://localhost:3002/

echo A new window was opened to run the server. Close it to stop SmartDo.
endlocal
