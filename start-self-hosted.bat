@echo off
REM TapCanvas NAS 自托管快速启动脚本 (Windows)

echo.
echo 🚀 TapCanvas 自托管部署启动脚本
echo ================================
echo.

REM 检查 Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：Docker 未安装或不在 PATH 中
    echo 请访问 https://www.docker.com/products/docker-desktop 安装 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker 已安装
echo.

REM 检查 .env 文件
if not exist ".env" (
    echo 📝 .env 文件不存在，正在创建...
    copy .env.example .env
    echo ✅ 已创建 .env，请编辑并填入以下信息：
    echo    - SMTP_USER: 163 邮箱地址
    echo    - SMTP_PASS: 163 授权码
    echo.
    set /p edit="是否立即编辑 .env 文件？(y/n) "
    if /i "%edit%"=="y" (
        notepad .env
    )
)

echo.
echo 📧 正在启动服务...
docker-compose -f docker-compose.self-hosted.yml up -d

REM 等待服务启动
timeout /t 5 /nobreak

echo.
echo ================================
echo 🎉 启动完成！
echo ================================
echo.
echo 📋 服务信息：
echo   • 邮件服务: http://localhost:3001
echo   • 前端应用: http://localhost:5173
echo   • API 服务: http://localhost:8787
echo.
echo 📋 有用的命令：
echo   查看日志:     docker-compose -f docker-compose.self-hosted.yml logs -f
echo   停止服务:     docker-compose -f docker-compose.self-hosted.yml down
echo   重启服务:     docker-compose -f docker-compose.self-hosted.yml restart
echo.
echo 📖 更多信息: 查看 docs/SELF_HOSTED_DEPLOYMENT.md
echo.
pause
