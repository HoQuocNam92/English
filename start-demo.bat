@echo off
chcp 65001 > nul
title TechEnglish Pro - Khoi dong Demo
echo ===================================================
echo       TechEnglish Pro - Khởi động Demo
echo ===================================================
echo.
set "PATH=C:\laragon\bin\nodejs\node-v22;%PATH%"

echo 1. Đang khởi động Backend API (Port 8080)...
start "TechEnglish API (Port 8080)" cmd /k "set PATH=C:\laragon\bin\nodejs\node-v22;%%PATH%% && cd apps\api && pnpm.cmd dev"

echo 2. Đang khởi động Web App (Port 3000)...
start "TechEnglish Web (Port 3000)" cmd /k "set PATH=C:\laragon\bin\nodejs\node-v22;%%PATH%% && cd apps\web && pnpm.cmd dev"

echo.
echo ===================================================
echo   Hệ thống đang chạy ngầm:
echo   - Backend API & Swagger: http://localhost:8080/api/docs
echo   - Web Frontend Portal:  http://localhost:3000
echo ===================================================
echo.
echo (Nhấn phím bất kỳ để đóng cửa sổ này, 2 ứng dụng vẫn tiếp tục chạy)
pause > nul
