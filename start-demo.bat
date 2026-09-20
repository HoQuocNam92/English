@echo off
chcp 65001 > nul
title TechEnglish Pro - Khoi dong Demo
echo ===================================================
echo       TechEnglish Pro - Khởi động Demo
echo ===================================================
echo.
set "PATH=C:\laragon\bin\nodejs\node-v22;%PATH%"

if not exist ".env" (
  echo [ERROR] Thieu file .env o thu muc goc. Hay copy .env.example thanh .env.
  exit /b 1
)

for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
  if not "%%A"=="" set "%%A=%%B"
)

if not defined PORT (
  echo [ERROR] PORT chua duoc cau hinh trong .env
  exit /b 1
)
if not defined WEB_PORT (
  echo [ERROR] WEB_PORT chua duoc cau hinh trong .env
  exit /b 1
)
if not defined API_PUBLIC_URL (
  echo [ERROR] API_PUBLIC_URL chua duoc cau hinh trong .env
  exit /b 1
)
if not defined WEB_URL (
  echo [ERROR] WEB_URL chua duoc cau hinh trong .env
  exit /b 1
)
if not defined NEXT_PUBLIC_API_URL (
  echo [ERROR] NEXT_PUBLIC_API_URL chua duoc cau hinh trong .env
  exit /b 1
)

echo 1. Đang khởi động Backend API (Port %PORT%)...
start "TechEnglish API (Port %PORT%)" cmd /k "set PATH=C:\laragon\bin\nodejs\node-v22;%%PATH%% && cd apps\api && pnpm.cmd dev"

echo 2. Đang khởi động Web App (Port %WEB_PORT%)...
start "TechEnglish Web (Port %WEB_PORT%)" cmd /k "set PATH=C:\laragon\bin\nodejs\node-v22;%%PATH%% && cd apps\web && pnpm.cmd dev -- -p %WEB_PORT%"

echo.
echo ===================================================
echo   Hệ thống đang chạy ngầm:
echo   - Backend API & Swagger: %API_PUBLIC_URL%/api/docs
echo   - Web Frontend Portal:  %WEB_URL%
echo ===================================================
echo.
echo (Nhấn phím bất kỳ để đóng cửa sổ này, 2 ứng dụng vẫn tiếp tục chạy)
pause > nul
