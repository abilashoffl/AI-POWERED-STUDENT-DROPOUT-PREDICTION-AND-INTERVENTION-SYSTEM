@echo off
title AI Student Dropout Prediction ^& Intervention System
echo ========================================================
echo  Starting AI Student Dropout Prediction ^& Intervention System
echo ========================================================

set "BASE_DIR=%~dp0"
if exist "%BASE_DIR%abliash\ml-service" (
    set "PROJECT_DIR=%BASE_DIR%abliash"
) else (
    set "PROJECT_DIR=%BASE_DIR%"
)

echo Project directory: %PROJECT_DIR%

echo.
echo [1/3] Starting ML Prediction Engine (FastAPI on Port 8000)...
start "ML Service (FastAPI - Port 8000)" /d "%PROJECT_DIR%\ml-service" cmd /k "python main.py"

echo [2/3] Starting Backend API (Express on Port 5000)...
start "Backend API (Express - Port 5000)" /d "%PROJECT_DIR%\backend" cmd /k "npm run dev"

echo [3/3] Starting Frontend UI (React + Vite on Port 3000)...
start "Frontend UI (React Vite - Port 3000)" /d "%PROJECT_DIR%\frontend" cmd /k "npm run dev"

echo.
echo Waiting 6 seconds for services to initialize...
timeout /t 6 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ========================================================
echo  All 3 services are running!
echo  - This PC:       http://localhost:3000
echo  - Mobile / Phone: Check your Wi-Fi IP address on port 3000
echo.
echo  Student Login: alex@student / student@123
echo  Admin Login:   admin@college.edu / admin123
echo ========================================================
echo Keep the opened terminal windows running while using the app.
pause
