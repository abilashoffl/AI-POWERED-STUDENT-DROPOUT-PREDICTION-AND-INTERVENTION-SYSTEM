@echo off
title Push AI Dropout Prediction System to GitHub
color 0b
echo ========================================================================
echo   Push Project to GitHub
echo   Repository: https://github.com/abilashoffl/AI-POWERED-STUDENT-DROPOUT-PREDICTION-AND-INTERVENTION-SYSTEM.git
echo ========================================================================
echo.

set "PATH=%PATH%;C:\Users\acer\AppData\Local\Programs\Git\cmd"
cd /d "%~dp0"
if exist "abliash\ml-service" cd abliash

echo Checking Git status...
git status --short
echo.

echo Choose how you want to push:
echo.
echo [1] Push directly (Opens standard GitHub credential prompt)
echo [2] Push using a GitHub Personal Access Token (PAT)
echo.
set /p choice="Enter choice [1 or 2]: "

if "%choice%"=="2" (
    echo.
    echo ------------------------------------------------------------------------
    echo If you don't have a token yet:
    echo 1. Open: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Check "repo" scope and click "Generate token"
    echo ------------------------------------------------------------------------
    echo.
    set /p token="Paste your GitHub Personal Access Token: "
    echo.
    echo Pushing with access token...
    git push https://abilashoffl:%token%@github.com/abilashoffl/AI-POWERED-STUDENT-DROPOUT-PREDICTION-AND-INTERVENTION-SYSTEM.git main
) else (
    echo.
    echo Pushing to GitHub...
    git push -u origin main
)

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================================
    echo   SUCCESS! Your project has been pushed to GitHub.
    echo   View online: https://github.com/abilashoffl/AI-POWERED-STUDENT-DROPOUT-PREDICTION-AND-INTERVENTION-SYSTEM
    echo ========================================================================
) else (
    echo ========================================================================
    echo   Push failed or cancelled.
    echo   Make sure your GitHub username and token are valid.
    echo ========================================================================
)

echo.
pause
