@echo off
title Rebel Tech Website
cd /d "%~dp0"

echo.
echo ==========================================
echo       REBEL TECH WEBSITE
echo ==========================================
echo.
echo Installing/checking dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Make sure Node.js 20+ is installed.
  pause
  exit /b 1
)

echo.
echo Starting Rebel Tech on http://localhost:3000 ...
echo The Node server now runs BOTH the API and the Vite development frontend.
echo Close this window to stop the website.
echo.
call npm run dev
pause
