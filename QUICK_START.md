# 🚀 TapCanvas 邮件认证系统 - 快速参考

## 项目已完成

✅ **邮箱登录系统完全替换 GitHub OAuth**

从 GitHub OAuth 完全迁移到邮箱验证码登录系统，使用 163 SMTP 发送邮件，所有组件已就绪。

---

## 📂 新增文件结构

```
apps/
├── email-relay/                    # 独立邮件中转服务
│   ├── src/
│   │   ├── index.js               # Express 服务器
│   │   └── mailer.js              # nodemailer + 163 SMTP
│   ├── Dockerfile                 # 容器配置
│   ├── package.json               # 依赖
│   ├── .env.example               # 邮件配置模板
│   └── README.md                  # 服务文档
├── web/
│   ├── src/auth/
│   │   └── EmailGate.tsx           # ✅ 新增（已修复）
│   └── Dockerfile                 # 前端容器
├── hono-api/
│   └── src/modules/email/
│       └── email.service.ts        # ✅ 改造（调用中转服务）
│
docker-compose.self-hosted.yml      # 📦 Docker Compose 编排
docs/
└── SELF_HOSTED_DEPLOYMENT.md       # 📖 完整部署指南

.env.example                        # 环境配置模板
start-self-hosted.sh                # 🐧 Linux/Mac 启动脚本
start-self-hosted.bat               # 🪟 Windows 启动脚本
```

---

## 🔧 快速开始（3 步）

### 1️⃣ 获取 163 授权码

```
1. 打开 https://mail.163.com 登录
2. 设置 → 账户安全 → 启用 IMAP/SMTP
3. 生成授权码 → 复制保存
```

### 2️⃣ 配置环境

```bash
# 复制配置文件
cp .env.example .env

# 编辑 .env，填入：
SMTP_USER=your-email@163.com
SMTP_PASS=your-auth-code
```

### 3️⃣ 启动服务

**Linux/Mac:**
```bash
bash start-self-hosted.sh
```

**Windows:**
```cmd
start-self-hosted.bat
```

---

## 📋 核心改变

| 组件 | 之前 | 现在 |
|------|------|------|
| 登录方式 | GitHub OAuth | 邮箱 + 验证码 |
| 邮件服务 | SendGrid API | 独立 Node.js 中转 |
| SMTP | 无（Workers 限制） | 163 SMTP |
| 部署方式 | Cloudflare Workers | Docker Compose + NAS |
| 验证流程 | GitHub 账户 | 邮箱 + 密码 |

---

## 🔌 API 端点

### 邮件中转服务 (`http://localhost:3001`)

```bash
# 健康检查
GET /health

# 发送验证码
POST /send-code
{
  "to": "user@example.com",
  "code": "123456",
  "purpose": "signup" | "reset" | "verify"
}

# 发送自定义邮件
POST /send
{
  "to": "user@example.com",
  "subject": "Test",
  "html": "<h1>Hello</h1>",
  "text": "Hello"
}
```

### 认证 API (`http://localhost:8787`)

```bash
# 发送验证码
POST /auth/email/send-code
{ "email": "user@163.com" }

# 邮箱注册
POST /auth/email/signup
{
  "email": "user@163.com",
  "password": "password123",
  "code": "123456",
  "name": "User"
}

# 邮箱登录
POST /auth/email/login
{
  "email": "user@163.com",
  "password": "password123"
}

# 重置密码
POST /auth/email/reset-password
{
  "email": "user@163.com",
  "code": "123456",
  "newPassword": "newpass123"
}
```

---

## 🧪 测试命令

```bash
# 1. 检查邮件服务
curl http://localhost:3001/health

# 2. 发送测试邮件
curl -X POST http://localhost:3001/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@163.com",
    "code": "123456",
    "purpose": "signup"
  }'

# 3. 注册账户
curl -X POST http://localhost:8787/auth/email/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@163.com",
    "password": "Test12345",
    "code": "123456",
    "name": "Test User"
  }'

# 4. 登录
curl -X POST http://localhost:8787/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@163.com",
    "password": "Test12345"
  }'
```

---

## 🐳 Docker 常用命令

```bash
# 启动所有服务
docker-compose -f docker-compose.self-hosted.yml up -d

# 查看日志（实时）
docker-compose -f docker-compose.self-hosted.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.self-hosted.yml logs -f email-relay

# 停止服务
docker-compose -f docker-compose.self-hosted.yml down

# 重启服务
docker-compose -f docker-compose.self-hosted.yml restart

# 进入邮件服务容器
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh

# 查看资源使用
docker-compose -f docker-compose.self-hosted.yml stats
```

---

## 🚨 常见问题

### Q: 邮件无法发送

**A:** 检查：
1. 163 账户是否启用了 SMTP
2. 授权码是否正确（不是密码）
3. 邮件服务是否运行

```bash
docker-compose -f docker-compose.self-hosted.yml logs email-relay
```

### Q: 无法连接到服务

**A:** 检查防火墙和端口：
```bash
# Linux
sudo ufw allow 3001
sudo ufw allow 5173
sudo ufw allow 8787

# 检查端口是否开放
netstat -tuln | grep 3001
```

### Q: Docker 镜像构建失败

**A:** 重新构建：
```bash
docker-compose -f docker-compose.self-hosted.yml build --no-cache
```

---

## 📖 更多文档

| 文档 | 内容 |
|------|------|
| [SELF_HOSTED_DEPLOYMENT.md](./docs/SELF_HOSTED_DEPLOYMENT.md) | 完整部署指南 |
| [apps/email-relay/README.md](./apps/email-relay/README.md) | 邮件服务文档 |
| [apps/hono-api/README.md](./apps/hono-api/README.md) | API 文档 |
| [apps/web/README.md](./apps/web/README.md) | 前端文档 |

---

## 🎯 下一步

1. **配置 163 邮箱**：获取授权码
2. **填写环境变量**：编辑 `.env`
3. **启动服务**：运行启动脚本
4. **测试流程**：注册、登录、重置密码
5. **配置域名**：使用反向代理（Nginx/Traefik）

---

## 🔐 安全提示

- ⚠️ 不要将 `.env` 提交到 Git
- ⚠️ 定期更换授权码
- ⚠️ 生产环境启用 HTTPS
- ⚠️ 配置防火墙只允许必要的端口

---

## 技术栈

- **邮件服务**: Node.js + Express + nodemailer
- **SMTP**: 163 邮箱 SMTP 服务
- **前端**: React + Mantine UI + Vite
- **API**: Hono（Cloudflare Workers）
- **部署**: Docker + Docker Compose
- **数据库**: D1 SQLite（Cloudflare）或本地

---

## 文件清单

✅ **创建的文件**：
- `apps/email-relay/` - 完整的邮件中转服务
- `docker-compose.self-hosted.yml` - Docker 编排
- `docs/SELF_HOSTED_DEPLOYMENT.md` - 部署指南
- `.env.example` - 配置模板
- `start-self-hosted.sh` - Linux/Mac 启动脚本
- `start-self-hosted.bat` - Windows 启动脚本

✅ **修改的文件**：
- `apps/hono-api/src/modules/email/email.service.ts` - 改用中转服务
- `apps/hono-api/src/config.ts` - 添加邮件服务配置
- `apps/web/src/auth/EmailGate.tsx` - 已修复重复内容

---

**系统已完全就绪！** 🎉

按照快速开始的 3 步启动即可。有任何问题，查看详细部署指南。
