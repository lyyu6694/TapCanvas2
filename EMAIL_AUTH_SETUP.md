# 邮箱登录功能配置指南

## 概述

此项目已从 GitHub OAuth 重构为邮箱验证码登录系统。新系统支持：

- ✅ 邮箱注册（带验证码）
- ✅ 邮箱登录（邮箱+密码）
- ✅ 密码重置（验证码验证）
- ✅ 密码加密存储（使用 SHA-256）
- ✅ 验证码有效期（10分钟）
- ✅ 验证码尝试限制（5次失败后锁定）

## 后端配置

### 数据库迁移

运行以下命令更新数据库 schema：

```bash
pnpm --filter ./apps/hono-api db:update:local
# 或远程：
pnpm --filter ./apps/hono-api db:update:remote
```

这会创建以下新表：
- `email_verification_codes` - 存储验证码
- 更新 `users` 表添加 `password_hash` 字段

### 环境变量

在 `wrangler.toml` 或环境变量中配置：

#### 必需配置

```toml
[env.production]
vars = { 
  # ... 其他变量
  SENDGRID_API_KEY = "sg_xxx_xxxxxx"  # SendGrid API Key
  JWT_SECRET = "your-secret-key"      # JWT 签名密钥
}
```

#### 可选配置（GitHub OAuth 仍可用）

```toml
[env.production]
vars = {
  GITHUB_CLIENT_ID = "xxx"
  GITHUB_CLIENT_SECRET = "xxx"
}
```

### SendGrid 配置

1. **获取 SendGrid API Key**：
   - 访问 [SendGrid](https://sendgrid.com)
   - 注册账户
   - 进入 Settings → API Keys
   - 创建新的 API Key（完整访问权限）
   - 复制并保存

2. **配置发送者邮箱**：
   - 在 SendGrid 中验证发送者邮箱或域名
   - 在 `email.service.ts` 中修改 `from` 邮箱地址

### 本地开发

创建 `.env.local` 文件（不提交到 Git）：

```bash
SENDGRID_API_KEY=sg_test_xxxxx
JWT_SECRET=dev-secret-key
```

或使用 `wrangler.toml` 的本地配置：

```toml
[env.local]
vars = {
  SENDGRID_API_KEY = "sg_test_xxxxx"
  JWT_SECRET = "dev-secret-key"
}
```

启动本地开发：

```bash
pnpm --filter ./apps/hono-api dev
pnpm dev:web
```

## 前端配置

### 环境变量

不需要额外配置。所有 API 端点已集成到 `/api/auth/email/*`。

### API 端点

后端提供以下认证端点：

| 方法 | 路由 | 说明 |
|------|------|------|
| POST | `/auth/email/send-code` | 发送验证码 |
| POST | `/auth/email/signup` | 邮箱注册 |
| POST | `/auth/email/login` | 邮箱登录 |
| POST | `/auth/email/reset-password` | 重置密码 |

## 测试流程

### 1. 注册新账户

```bash
# 步骤 1：获取验证码
curl -X POST http://localhost:8788/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"signup"}'

# 步骤 2：提交注册（使用收到的验证码）
curl -X POST http://localhost:8788/auth/email/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123",
    "code":"123456",
    "name":"Your Name"
  }'
```

### 2. 登录

```bash
curl -X POST http://localhost:8788/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123"
  }'
```

### 3. 重置密码

```bash
# 步骤 1：获取重置码
curl -X POST http://localhost:8788/auth/email/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"reset"}'

# 步骤 2：重置密码
curl -X POST http://localhost:8788/auth/email/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "code":"123456",
    "newPassword":"NewSecurePass456"
  }'
```

## 故障排查

### 邮件未收到

1. **检查 SendGrid 配置**：
   - 确认 API Key 正确
   - 检查 SendGrid 仪表板的邮件活动
   - 查看 API 调用日志

2. **检查发送者邮箱**：
   - 发送者邮箱必须在 SendGrid 中验证
   - 检查垃圾邮件文件夹

3. **检查服务器日志**：
   ```bash
   pnpm --filter ./apps/hono-api dev:log
   ```

### 验证码失效

- 验证码有效期为 **10 分钟**
- 失败 5 次后将被锁定
- 请求新验证码会覆盖旧的

### 数据库错误

- 确保已运行 `db:update:local/remote`
- 检查 SQLite 权限
- 查看错误日志中的 SQL 错误信息

## 安全建议

1. **密码要求**：
   - 最少 8 个字符
   - 前端验证 + 后端验证
   - 使用 SHA-256 加密存储

2. **验证码安全**：
   - 6 位随机数字
   - 10 分钟有效期
   - 5 次失败限制

3. **生产部署**：
   - 使用 HTTPS
   - 启用 CORS 白名单
   - 定期轮换 JWT 密钥
   - 监控异常登录尝试

## GitHub OAuth 兼容性

旧的 GitHub OAuth 登录仍可用。可以通过以下方式共存：

- 邮箱认证是默认主要登录方式
- GitHub 按钮可在登录界面中添加
- 同一用户可同时使用两种登录方式

## 迁移指南（从 GitHub OAuth）

如果从 GitHub OAuth 迁移现有用户：

1. **保留现有用户**：
   - 现有 GitHub 用户数据保持不变
   - 新用户必须使用邮箱注册

2. **添加邮箱登录选项**：
   - 为现有用户提供设置邮箱 + 密码的界面
   - 或通过 OAuth 的邮箱自动关联

3. **用户通知**：
   - 通知用户新的邮箱登录选项
   - 提供密码重置指导

## 支持

如有问题，请查看：
- 后端日志：`pnpm --filter ./apps/hono-api dev:log`
- 前端控制台：浏览器开发者工具 (F12)
- 数据库：使用 SQLite 客户端检查表结构
