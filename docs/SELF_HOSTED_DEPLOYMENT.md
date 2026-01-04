# NAS 自托管部署指南

## 🎯 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAS / 私有服务器                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  前端应用    │  │  Hono API    │  │ 邮件中转服务 │           │
│  │  (React)     │  │(Cloudflare W)│  │(163 SMTP)    │           │
│  │  :5173       │  │  :8787       │  │   :3001      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│       ▼                   ▼                   ▲                   │
│       └───────────────────┼───────────────────┘                   │
│                           │                                       │
│                        ┌──▼──┐                                   │
│                        │ DB  │                                   │
│                        │ D1  │                                   │
│                        └─────┘                                   │
│                                                                   │
│  Docker Compose 编排                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 前置条件

1. **NAS 或服务器**
   - 已安装 Docker 和 Docker Compose
   - Ubuntu/Debian/Synology DSM 等 Linux 系统

2. **163 邮箱账户**
   - 支持 IMAP/SMTP（已启用）
   - 获取授权码（不是密码）

3. **Cloudflare 账户**（可选）
   - 如果使用 Cloudflare Workers 作为 API
   - 或使用本地 Hono 开发服务器

---

## 🚀 快速开始

### 1️⃣ 准备 163 SMTP

#### 获取 163 授权码

1. 访问 https://mail.163.com 登录邮箱
2. 点击右上角 **设置** → **账户安全**
3. 找到 **IMAP/SMTP** 和 **POP3/SMTP**，启用 SMTP
4. 下方会显示"授权码"，点击 **生成授权码**
5. 按照提示生成，复制授权码保存（仅显示一次！）

> ⚠️ **重要**：授权码 ≠ 邮箱密码，两者不同

#### 示例

```
邮箱: myemail@163.com
授权码: abcdefghijklmnop
```

### 2️⃣ 克隆项目

```bash
git clone <repo-url> tapcanvas
cd tapcanvas
```

### 3️⃣ 配置环境变量

创建 `.env` 文件在项目根目录：

```bash
# 邮件配置
SMTP_USER=myemail@163.com
SMTP_PASS=your-authorization-code

# 前端配置
VITE_API_URL=http://your-nas-ip:8787

# 端口配置（可选）
EMAIL_RELAY_PORT=3001
WEB_PORT=5173
API_PORT=8787

# 邮件服务配置（通常无需修改）
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
```

### 4️⃣ 启动服务

```bash
# 使用自托管配置启动
docker-compose -f docker-compose.self-hosted.yml up -d

# 查看日志
docker-compose -f docker-compose.self-hosted.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.self-hosted.yml logs -f email-relay
```

### 5️⃣ 验证服务状态

```bash
# 邮件服务健康检查
curl http://localhost:3001/health

# 应返回
# {"status":"ok","service":"email-relay"}
```

---

## 🔧 配置详解

### 环境变量说明

| 变量 | 说明 | 必需 | 默认值 |
|------|------|------|--------|
| `SMTP_USER` | 163 邮箱地址 | ✅ | - |
| `SMTP_PASS` | 163 授权码 | ✅ | - |
| `SMTP_HOST` | SMTP 服务器 | ❌ | smtp.163.com |
| `SMTP_PORT` | SMTP 端口 | ❌ | 465 |
| `SMTP_SECURE` | 使用 SSL/TLS | ❌ | true |
| `EMAIL_RELAY_PORT` | 邮件服务端口 | ❌ | 3001 |
| `WEB_PORT` | 前端服务端口 | ❌ | 5173 |
| `VITE_API_URL` | API 地址 | ❌ | http://localhost:8787 |

---

## 📧 邮件服务测试

### 发送测试邮件

```bash
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "测试邮件",
    "text": "这是一封测试邮件"
  }'
```

### 发送验证码

```bash
curl -X POST http://localhost:3001/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "code": "123456",
    "purpose": "signup"
  }'
```

---

## 🔌 Hono API 配置

### 开发模式

使用 Cloudflare Wrangler 本地开发：

```bash
cd apps/hono-api

# 配置 wrangler.toml
# 添加环境变量
[env.development]
vars = {
  EMAIL_RELAY_URL = "http://email-relay:3001"
}

# 启动开发服务器
wrangler dev
```

### 环境变量（wrangler.toml）

```toml
[env.production]
vars = {
  JWT_SECRET = "your-secret-key",
  EMAIL_RELAY_URL = "http://email-relay:3001",
  GITHUB_CLIENT_ID = "optional",
  GITHUB_CLIENT_SECRET = "optional"
}
```

---

## 🐳 Docker Compose 命令

```bash
# 启动所有服务
docker-compose -f docker-compose.self-hosted.yml up -d

# 停止所有服务
docker-compose -f docker-compose.self-hosted.yml down

# 重启服务
docker-compose -f docker-compose.self-hosted.yml restart

# 查看日志（实时）
docker-compose -f docker-compose.self-hosted.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.self-hosted.yml logs -f email-relay

# 进入容器
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh

# 查看资源使用
docker-compose -f docker-compose.self-hosted.yml stats
```

---

## 🚨 故障排查

### 问题 1: "SMTP connection failed"

**症状**：邮件服务启动失败，日志显示 SMTP 连接错误

**解决步骤**：

1. 检查 163 邮箱是否启用了 IMAP/SMTP
2. 确认使用的是 **授权码** 而非密码
3. 确保 `.env` 中的 `SMTP_USER` 和 `SMTP_PASS` 正确
4. 尝试重新生成授权码

```bash
# 查看详细错误
docker-compose -f docker-compose.self-hosted.yml logs email-relay
```

### 问题 2: "Email send failed"

**症状**：邮件发送失败，返回 500 错误

**解决步骤**：

1. 确保邮件服务容器正在运行
2. 检查邮件服务日志

```bash
docker-compose -f docker-compose.self-hosted.yml logs -f email-relay
```

3. 测试邮件发送 API

```bash
curl http://localhost:3001/health
```

### 问题 3: 容器启动失败

**症状**：`docker-compose up -d` 后立即停止

**解决步骤**：

```bash
# 查看详细错误
docker-compose -f docker-compose.self-hosted.yml up --no-detach

# 或查看容器日志
docker logs tapcanvas-email-relay

# 重建镜像
docker-compose -f docker-compose.self-hosted.yml build --no-cache
```

### 问题 4: 无法连接到服务

**症状**：浏览器无法访问 http://nas-ip:5173

**解决步骤**：

1. 检查防火墙是否开放相关端口
2. 确保服务已启动

```bash
docker ps | grep tapcanvas
```

3. 检查服务是否正在监听端口

```bash
docker-compose -f docker-compose.self-hosted.yml logs web
```

---

## 📊 监控和管理

### 查看资源使用情况

```bash
docker stats tapcanvas-email-relay
docker stats tapcanvas-web
```

### 查看容器信息

```bash
docker ps -a
docker inspect tapcanvas-email-relay
```

### 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose -f docker-compose.self-hosted.yml build --no-cache

# 重启服务
docker-compose -f docker-compose.self-hosted.yml up -d
```

---

## 🔒 安全建议

1. **环境变量保护**
   - 不要将 `.env` 提交到 Git
   - 将 `.env` 加入 `.gitignore`
   - 在生产环境使用强密钥

2. **邮箱安全**
   - 定期更换授权码
   - 如果泄露，立即重新生成
   - 不要分享授权码

3. **网络安全**
   - 配置反向代理（Nginx/Traefik）
   - 启用 HTTPS/SSL
   - 限制 API 访问

4. **日志管理**
   - 定期清理日志文件
   - 使用日志收集系统（如 ELK）

---

## 📈 性能优化

### 邮件服务调优

在 `apps/email-relay/.env` 中：

```env
# 连接池大小（可选）
# SMTP_POOL_SIZE=5

# 请求超时（毫秒）
# REQUEST_TIMEOUT=10000
```

### 容器资源限制

在 `docker-compose.self-hosted.yml` 中：

```yaml
email-relay:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```

---

## 🆘 获取帮助

1. **查看日志**

```bash
docker-compose -f docker-compose.self-hosted.yml logs -f
```

2. **测试邮件 API**

```bash
curl -v http://localhost:3001/health
```

3. **查看容器状态**

```bash
docker ps -a
```

---

## 📝 相关文档

- [Email Relay Service README](./apps/email-relay/README.md)
- [Hono API 配置](./apps/hono-api/README.md)
- [前端配置](./apps/web/README.md)
- [163 SMTP 设置指南](https://help.163.com/12/0517/14/92A7HI0Q00753VB8.html)

---

## 版本信息

- Node.js: 18.x
- Docker: 20.10+
- Docker Compose: 1.29+
- pnpm: 8.x

---

**最后更新**：2026年1月4日

有任何问题，请查看日志或参考故障排查部分。
