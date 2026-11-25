@echo off
title PreventAI
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is not installed. Get the LTS version from https://nodejs.org and try again. & pause & exit /b 1)
if not exist node_modules (
  echo First run: installing... this takes a minute or two.
  call npm.cmd install || (pause & exit /b 1)
)
set "VER=none"
if exist VERSION set /p VER=<VERSION
set "BUILT="
if exist .next\preventai-version.txt set /p BUILT=<.next\preventai-version.txt
if not exist .next\BUILD_ID set "BUILT="
if not "%VER%"=="%BUILT%" (
  echo Preparing the app... this only happens after an update.
  call npm.cmd run build || (pause & exit /b 1)
  copy /y VERSION .next\preventai-version.txt >nul
)
netstat -ano | findstr /r /c:":3000 .*LISTENING" >nul && (
  echo.
  echo   PreventAI ^(or another program^) is already running on port 3000.
  echo   Close the OTHER black PreventAI window first, then run this file again.
  echo   Otherwise your browser keeps showing the old version.
  echo.
  pause
  exit /b 1
)
call node scripts\check-ai.mjs
echo.
echo PreventAI is starting. Your browser will open in a few seconds.
echo Keep this window open while you use the app. Close it to stop PreventAI.
echo.
start "" cmd /c "timeout /t 6 >nul & start http://localhost:3000"
call npm.cmd start
