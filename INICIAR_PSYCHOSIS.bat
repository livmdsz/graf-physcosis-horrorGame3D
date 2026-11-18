@echo off
title PSYCHOSIS - Servidor local
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  start "PSYCHOSIS server" /D "%~dp0" py -m http.server 8000
) else (
  start "PSYCHOSIS server" /D "%~dp0" python -m http.server 8000
)
timeout /t 2 >nul
start "" http://localhost:8000/index.html
echo Mantén abierta la ventana del servidor mientras juegas.
pause
