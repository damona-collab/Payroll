@echo off
title BluvoPay - Namibian Payroll System
cd /d "%~dp0"

echo ============================================
echo   BluvoPay - Namibian Payroll System
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed. Please install it from https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo First run - installing dependencies, please wait...
    call npm install
)

echo Starting BluvoPay... your browser will open automatically.
echo Keep this window open while using the app. Close it to stop.
echo.
call npm run dev -- --open
pause
