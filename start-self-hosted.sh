#!/bin/bash

# TapCanvas NAS 自托管快速启动脚本

set -e

echo "🚀 TapCanvas 自托管部署启动脚本"
echo "================================"

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ 错误：Docker 未安装"
    echo "请访问 https://docs.docker.com/engine/install/ 安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误：Docker Compose 未安装"
    echo "请访问 https://docs.docker.com/compose/install/ 安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 和 Docker Compose 已安装"
echo ""

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "📝 .env 文件不存在，正在创建..."
    cp .env.example .env
    echo "✅ 已创建 .env，请编辑并填入以下信息："
    echo "   - SMTP_USER: 163 邮箱地址"
    echo "   - SMTP_PASS: 163 授权码"
    echo ""
    read -p "是否立即编辑 .env 文件？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano .env || vi .env
    fi
fi

echo ""
echo "📧 正在启动邮件中转服务..."

# 启动服务
docker-compose -f docker-compose.self-hosted.yml up -d

# 等待邮件服务就绪
echo "⏳ 等待邮件服务启动..."
sleep 5

# 检查邮件服务状态
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 邮件服务已就绪"
else
    echo "⚠️  邮件服务启动中，请稍候..."
    sleep 5
fi

echo ""
echo "================================"
echo "🎉 启动完成！"
echo "================================"
echo ""
echo "📋 服务信息："
echo "  • 邮件服务: http://localhost:3001"
echo "  • 前端应用: http://localhost:5173"
echo "  • API 服务: http://localhost:8787"
echo ""
echo "📋 有用的命令："
echo "  查看日志:     docker-compose -f docker-compose.self-hosted.yml logs -f"
echo "  停止服务:     docker-compose -f docker-compose.self-hosted.yml down"
echo "  重启服务:     docker-compose -f docker-compose.self-hosted.yml restart"
echo ""
echo "📖 更多信息: 查看 docs/SELF_HOSTED_DEPLOYMENT.md"
echo ""
