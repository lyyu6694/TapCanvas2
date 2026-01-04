# 🐳 飞牛 NAS Docker 部署

> TapCanvas 邮件认证系统在飞牛 NAS 上的 Docker 部署完整指南

---

## 🚀 快速开始

### 📖 文档导航

**首先阅读** ⭐⭐⭐⭐⭐

| 文档 | 说明 | 时间 |
|------|------|------|
| **[部署指南](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md)** | 详细的逐步教程 | 1h |
| **[部署清单](./docs/FILENASNAS_DEPLOYMENT_CHECKLIST.md)** | 可打印的检查清单 | - |
| [问题排查](./docs/FILENASNAS_TROUBLESHOOTING.md) | 常见问题和优化 | - |
| [文档索引](./docs/FILENASNAS_INDEX.md) | 完整文档导航 | - |

---

## ✨ 特点

- ✅ **国内友好**: 使用 163 SMTP 发送邮件
- ✅ **独立部署**: 不依赖 Cloudflare Workers
- ✅ **Docker 化**: 一键启动所有服务
- ✅ **完整文档**: 详细的步骤和故障排查
- ✅ **开箱即用**: 包含所有配置和脚本
- ✅ **定期维护**: 包含监控和备份指南

---

## 📋 3 步快速部署

### 1️⃣ 获取 163 授权码
```
https://mail.163.com
→ 设置 → 账户安全 → 启用 IMAP/SMTP
→ 生成授权码
```

### 2️⃣ 配置环境
```bash
cp .env.example .env

# 编辑 .env，填入:
SMTP_USER=your-email@163.com
SMTP_PASS=your-auth-code
VITE_API_URL=http://192.168.1.100:8787
```

### 3️⃣ 启动服务
```bash
docker-compose -f docker-compose.self-hosted.yml up -d

# 验证服务
curl http://localhost:3001/health
```

---

## 📚 完整文档

### 第一阶段：部署前准备
- [系统要求](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#系统要求)
- [准备工作](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#准备工作)
- [前置条件检查](./docs/FILENASNAS_DEPLOYMENT_CHECKLIST.md#部署前准备)

### 第二阶段：部署执行
- [访问飞牛 NAS](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#第一步访问飞牛-nas)
- [启用 Docker](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#第二步启用-docker)
- [配置项目](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#第三步配置项目)
- [部署服务](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#第四步部署服务)
- [验证服务](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#第五步验证服务)

### 第三阶段：维护和优化
- [日常维护](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md#第六步维护和管理)
- [故障排查](./docs/FILENASNAS_TROUBLESHOOTING.md#常见问题)
- [性能优化](./docs/FILENASNAS_TROUBLESHOOTING.md#性能优化)
- [安全加固](./docs/FILENASNAS_TROUBLESHOOTING.md#安全加固)

---

## 🎯 按需查找

### 我想部署系统
→ 查看 [部署指南](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md)

### 我遇到了问题
→ 查看 [常见问题](./docs/FILENASNAS_TROUBLESHOOTING.md)

### 我想优化性能
→ 查看 [性能优化](./docs/FILENASNAS_TROUBLESHOOTING.md#性能优化)

### 我需要打印检查清单
→ 下载 [部署清单](./docs/FILENASNAS_DEPLOYMENT_CHECKLIST.md)

### 我要找特定的文档
→ 查看 [文档索引](./docs/FILENASNAS_INDEX.md)

---

## 🔑 常用命令

```bash
# 查看服务状态
docker-compose -f docker-compose.self-hosted.yml ps

# 查看实时日志
docker-compose -f docker-compose.self-hosted.yml logs -f

# 重启服务
docker-compose -f docker-compose.self-hosted.yml restart

# 停止服务
docker-compose -f docker-compose.self-hosted.yml down

# 进入容器
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh

# 查看资源占用
docker stats
```

---

## 📊 架构图

```
┌─────────────────────────────────────────────────────┐
│                   飞牛 NAS (Docker)                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  前端    │  │  API     │  │ 邮件中转服务      │   │
│  │ React    │  │  Hono    │  │ Node.js 163 SMTP │   │
│  │ :5173    │  │ :8787    │  │    :3001         │   │
│  └──────────┘  └──────────┘  └────────┬─────────┘   │
│                                       │              │
│                                163 SMTP              │
│                                       │              │
└─────────────────────────────────────────────────────┘
        ↓
    用户邮件 (test@163.com)
```

---

## ✅ 验收标准

部署完成后应该能够：

- ✅ 访问前端应用 (http://192.168.1.100:5173)
- ✅ 正常发送和接收验证码邮件
- ✅ 完成用户注册流程
- ✅ 完成用户登录流程
- ✅ 完成密码重置流程
- ✅ 查看容器日志
- ✅ 监控系统资源

---

## 📝 文件清单

### 核心文件
```
apps/email-relay/                          # 邮件中转服务
├── src/index.js                          # Express 服务器
├── src/mailer.js                         # nodemailer 集成
├── Dockerfile                            # 容器配置
├── package.json                          # 依赖
├── .env.example                          # SMTP 配置模板
└── README.md                             # 服务文档

docker-compose.self-hosted.yml            # Docker 编排
.env.example                              # 环境配置模板
```

### 文档文件
```
docs/
├── FILENASNAS_INDEX.md                   # 📍 文档导航（从这里开始！）
├── FILENASNAS_DEPLOYMENT_GUIDE.md        # 部署指南
├── FILENASNAS_DEPLOYMENT_CHECKLIST.md    # 部署清单
└── FILENASNAS_TROUBLESHOOTING.md         # 问题排查
```

---

## 🌟 优势

### vs 云服务
- ✅ **完全离线**: 数据存储在自己的 NAS
- ✅ **成本低**: 只需一次性购买 NAS
- ✅ **隐私**: 邮件数据不经过第三方
- ✅ **可控**: 完全掌握系统配置

### vs 虚拟主机
- ✅ **稳定**: 家庭或办公 NAS 全天运行
- ✅ **灵活**: 可随时调整配置
- ✅ **学习**: 完整的技术栈学习机会
- ✅ **扩展**: 可轻松扩展新功能

---

## 🚨 注意事项

### 重要
- ⚠️ 保管好 163 授权码，不要分享
- ⚠️ 定期备份 `.env` 文件
- ⚠️ 监控磁盘空间
- ⚠️ 定期检查容器日志

### 安全建议
- 🔒 启用防火墙，只开放必要的端口
- 🔒 定期更新 Docker 和系统
- 🔒 使用强密码保护 NAS 管理界面
- 🔒 考虑配置反向代理和 HTTPS

---

## 📞 需要帮助？

### 按步骤排查
1. 查看 [部署指南](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md) 中的"故障排查"
2. 查看 [常见问题](./docs/FILENASNAS_TROUBLESHOOTING.md)
3. 检查容器日志：`docker-compose logs -f`

### 自助资源
- [Docker 官方文档](https://docs.docker.com)
- [飞牛 NAS 官网](https://www.filenasnas.com)
- [GitHub Issues](https://github.com/your-repo/issues)

---

## 📈 后续步骤

### 基础维护
- [ ] 每周检查一次磁盘空间
- [ ] 每周查看一次容器日志
- [ ] 定期测试邮件发送功能

### 进阶配置
- [ ] 配置 Nginx 反向代理
- [ ] 启用 HTTPS/SSL
- [ ] 配置自定义域名
- [ ] 设置监控告警

### 功能扩展
- [ ] 集成 GitHub OAuth（可选）
- [ ] 添加两因素认证
- [ ] 集成更多邮件服务
- [ ] 添加邮件模板管理

---

## 📊 性能参考

| 指标 | 预期值 |
|------|--------|
| 邮件发送耗时 | < 2 秒 |
| 页面加载时间 | < 1 秒 |
| API 响应时间 | < 500ms |
| 内存占用 | 300-500MB |
| CPU 占用 | < 10% |
| 磁盘占用 | < 1GB |

---

## 🎓 学习资源

### 官方文档
- 飞牛 NAS: https://www.filenasnas.com
- Docker: https://docs.docker.com
- Node.js: https://nodejs.org/docs

### 视频教程
- Docker 基础: YouTube 搜索 "Docker Tutorial"
- 163 邮箱配置: 163 官方帮助中心

### 社区资源
- Docker Hub: https://hub.docker.com
- Stack Overflow: docker, docker-compose 标签
- GitHub: 搜索相关项目和 Issues

---

## ✨ 更新日志

### v1.0.0 (2026-01-04)
- ✅ 初始版本发布
- ✅ 完整的部署指南
- ✅ 常见问题排查
- ✅ 部署清单和检查表

---

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE)

---

**Happy Deploying! 🚀**

需要帮助？ → 查看 [部署指南](./docs/FILENASNAS_DEPLOYMENT_GUIDE.md)

遇到问题？ → 查看 [常见问题](./docs/FILENASNAS_TROUBLESHOOTING.md)

找不到文档？ → 查看 [文档索引](./docs/FILENASNAS_INDEX.md)

---

**最后更新**: 2026年1月4日
