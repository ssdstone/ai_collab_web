@echo off
chcp 65001 > nul
title AI Web Generator

echo.
echo  ================================================
echo   AI Collaboration Page Generator - Starting...
echo  ================================================
echo.

:: Check Python
python --version > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9+
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
python -m pip install flask openai --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo       Done

echo.
echo [2/3] Starting Flask server...
echo.
echo  -----------------------------------------------
echo   URL: http://127.0.0.1:5000
echo   Press Ctrl+C to stop
echo  -----------------------------------------------
echo.

:: Open browser after 2 seconds
start /b cmd /c "timeout /t 2 > nul && start http://127.0.0.1:5000"

echo [3/3] Browser will open automatically...
echo.

python app.py

pause
