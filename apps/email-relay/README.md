# Email Relay Service

独立的 Node.js 邮件中转服务，使用 nodemailer + 163 SMTP，为 TapCanvas 提供可靠的邮件发送能力。

## 🚀 特性

- ✅ 基于 Express.js 的轻量级 HTTP API
- ✅ 支持 163 SMTP（国内稳定可靠）
- ✅ 预设验证码邮件模板
- ✅ Docker 容器化部署
- ✅ 健康检查端点
- ✅ CORS 支持

## 🔧 配置

### 获取 163 授权码

1. 访问 https://mail.163.com 登录账号
2. 点击 **设置** → **账户安全**
3. 启用 **IMAP/SMTP**
4. 生成并复制 **授权码**（不是密码！）
5. 将授权码填入环境变量 `SMTP_PASS`

### 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
PORT=3001
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASS=your-authorization-code
```

## 📦 本地开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

服务会运行在 `http://localhost:3001`

## 🐳 Docker 部署

### 使用 Docker Compose

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  email-relay:
    build: ./apps/email-relay
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      SMTP_HOST: smtp.163.com
      SMTP_PORT: 465
      SMTP_SECURE: "true"
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    restart: unless-stopped
    networks:
      - tapcanvas
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

networks:
  tapcanvas:
    driver: bridge
```

### 启动服务

```bash
# 创建 .env 文件
echo "SMTP_USER=your-email@163.com" > .env
echo "SMTP_PASS=your-auth-code" >> .env

# 启动容器
docker-compose up -d email-relay

# 查看日志
docker-compose logs -f email-relay
```

## 🔌 API 端点

### 健康检查

```bash
GET /health
```

**响应：**
```json
{
  "status": "ok",
  "service": "email-relay"
}
```

### 发送邮件

```bash
POST /send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello</h1>",
  "text": "Hello"
}
```

**响应：**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@163.com>"
}
```

### 发送验证码

```bash
POST /send-code
Content-Type: application/json

{
  "to": "user@example.com",
  "code": "123456",
  "purpose": "signup"
}
```

**参数说明：**
- `to`: 收件人邮箱
- `code`: 6 位验证码
- `purpose`: 用途 (`signup` | `reset` | `verify`)

**响应：**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "messageId": "<message-id@163.com>"
}
```

## 🧪 测试

```bash
# 测试邮件发送
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "text": "Hello World"
  }'

# 测试验证码发送
curl -X POST http://localhost:3001/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "code": "123456",
    "purpose": "signup"
  }'
```

## 🔗 与 Hono API 集成

在 Hono API 的 `email.service.ts` 中配置邮件中转服务地址：

```typescript
const emailRelayUrl = process.env.EMAIL_RELAY_URL || 'http://email-relay:3001'

export async function sendVerificationCode(email: string, purpose: 'signup' | 'reset' | 'verify') {
  const code = generateVerificationCode()
  
  const response = await fetch(`${emailRelayUrl}/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, code, purpose })
  })
  
  if (!response.ok) throw new Error('Failed to send verification code')
  return code
}
```

## 🚨 故障排查

### "SMTP connection failed"

- 检查 163 邮箱和授权码是否正确
- 确保 163 账户已启用 IMAP/SMTP
- 检查防火墙是否阻止 465 端口

### "Email send failed: Invalid login"

- 确保使用的是 **授权码** 而不是密码
- 重新生成授权码再试

### Docker 容器启动失败

```bash
# 查看详细日志
docker-compose logs email-relay

# 重建镜像
docker-compose build --no-cache email-relay
```

## 📝 许可证

MIT
