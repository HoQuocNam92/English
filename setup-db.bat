@echo off
chcp 65001 > nul
title TechEnglish Pro - Khoi tao Database
echo ===================================================
echo       TechEnglish Pro - Khởi tạo Database
echo ===================================================
echo.
set "PATH=C:\laragon\bin\nodejs\node-v22;%PATH%"

echo [1/3] Sinh mã Prisma Client...
call pnpm.cmd --filter @techenglish/api db:generate

echo.
echo [2/3] Đồng bộ cấu trúc bảng vào PostgreSQL (db:push)...
call pnpm.cmd --filter @techenglish/api db:push

echo.
echo [3/3] Nạp dữ liệu mẫu hệ thống (db:seed)...
call pnpm.cmd --filter @techenglish/api db:seed

echo.
echo ===================================================
echo   Hoàn tất khởi tạo Database!
echo ===================================================
pause
