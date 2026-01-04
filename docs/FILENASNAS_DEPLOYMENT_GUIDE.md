# 飞牛 NAS Docker 部署 TapCanvas 完整指南

**最后更新**: 2026年1月4日  
**适配系统**: 飞牛 NAS（FileNAS/FN系列）  
**难度级别**: ⭐⭐ 中等

---

## 📋 目录

1. [系统要求](#系统要求)
2. [准备工作](#准备工作)
3. [第一步：访问飞牛 NAS](#第一步访问飞牛-nas)
4. [第二步：启用 Docker](#第二步启用-docker)
5. [第三步：配置项目](#第三步配置项目)
6. [第四步：部署服务](#第四步部署服务)
7. [第五步：验证服务](#第五步验证服务)
8. [第六步：维护和管理](#第六步维护和管理)
9. [故障排查](#故障排查)
10. [监控和日志](#监控和日志)

---

## 系统要求

### 硬件要求

- 📦 **CPU**: 四核或更高（推荐）
- 🧠 **内存**: 4GB 或更高（8GB 推荐）
- 💾 **存储**: 至少 10GB 剩余空间
- 🔌 **网络**: 有线网络连接（推荐）

### 软件要求

- 🐳 **Docker**: 版本 20.10+
- 🐳 **Docker Compose**: 版本 1.29+
- 📝 **文本编辑器**: 支持 UTF-8 编码

### 前置条件

- ✅ 已获取 163 邮箱授权码
- ✅ 已 clone/下载 TapCanvas 项目
- ✅ 拥有飞牛 NAS 的管理员权限

---

## 准备工作

### 1️⃣ 了解飞牛 NAS 基本信息

```
获取 NAS IP 地址:
  • 使用飞牛官方 App 查看
  • 或登录路由器查看连接设备
  • 或通过 192.168.1.1 进入路由器
  
示例: http://192.168.1.100:8080
```

### 2️⃣ 准备 163 邮箱

**获取授权码步骤**:

1. 打开 https://mail.163.com 登录账号
2. 点击左上角 **邮箱**
3. 进入 **设置** → **账户安全**
4. 找到 **IMAP/SMTP** 和 **POP3/SMTP**
5. 点击 **启用**
6. 点击 **生成授权码**
7. 按提示验证身份（手机验证码或密码）
8. **复制并保存授权码**（仅显示一次！）

> ⚠️ **重要**: 授权码 ≠ 邮箱密码，两者完全不同！

### 3️⃣ 下载项目文件

```bash
# 方式 1: 使用 Git (如果 NAS 有 Git)
git clone https://github.com/your-repo/tapcanvas.git

# 方式 2: 下载 ZIP 并上传
# 1. 下载 https://github.com/your-repo/tapcanvas/archive/main.zip
# 2. 解压到 NAS 共享目录
```

---

## 第一步：访问飞牛 NAS

### 1️⃣ 打开飞牛管理界面

**方式 A: 使用官方 App**
```
1. 下载"飞牛 NAS"官方 App
2. 登录账号
3. 找到你的 NAS 设备
4. 点击"Web 访问"
```

**方式 B: 浏览器访问**
```
在浏览器输入:
http://[NAS_IP]:8080

示例: http://192.168.1.100:8080
```

### 2️⃣ 登录飞牛管理系统

```
用户名: admin (默认)
密码: 飞牛 (默认，可能已修改)
```

### 3️⃣ 进入系统设置

```
左侧菜单 → 系统设置
或
左侧菜单 → 应用中心
```

---

## 第二步：启用 Docker

### 🔧 方式 1: 使用飞牛应用中心（推荐）

**步骤**:

1. 左侧菜单 → **应用中心**
2. 搜索 **Docker** 或 **容器**
3. 找到 **Docker CE** 应用
4. 点击 **安装** 或 **启用**
5. 等待安装完成（2-5 分钟）

**验证安装**:

```bash
打开终端，执行:
docker --version

应该显示:
Docker version 20.10.x, build xxxxx
```

### 🔧 方式 2: SSH 连接安装（高级用户）

**1. 启用 SSH 服务**

```
设置 → 网络设置 → SSH
启用 SSH 并记住端口号（默认 22）
```

**2. SSH 连接到 NAS**

```bash
# Linux/Mac
ssh admin@192.168.1.100 -p 22

# Windows 用户建议使用 PuTTY 或 Windows Terminal

# 输入密码（默认: 飞牛)
```

**3. 验证 Docker**

```bash
docker --version
docker-compose --version
```

---

## 第三步：配置项目

### 1️⃣ 上传项目文件到 NAS

**方式 A: 使用飞牛 NAS 的文件管理**

```
1. 在 Web 管理界面打开"文件管理"
2. 进入 /mnt/docker 或 /opt/docker 目录
   (如果没有这个目录，先创建)
3. 上传 tapcanvas 项目文件夹
   或 在此目录新建文件夹
```

**方式 B: 使用 Samba 网络共享**

```
1. NAS 上已启用 Samba 共享
2. 在 Windows: \\192.168.1.100\
3. 在 Mac: cmd+K 输入 smb://192.168.1.100
4. 找到合适目录上传项目
```

**方式 C: 使用 SFTP**

```bash
# Linux/Mac
sftp -P 22 admin@192.168.1.100
cd /mnt/docker
put -r tapcanvas

# Windows 可用 FileZilla
```

### 2️⃣ 创建配置文件

**在 NAS 上创建 `.env` 文件**

```bash
# 方法 1: 使用 Web 管理界面编辑
# 进入文件管理 → tapcanvas 目录
# 新建文件 → .env

# 方法 2: 使用 SSH 命令
ssh admin@192.168.1.100

cd /mnt/docker/tapcanvas
nano .env  # 或 vi .env
```

**编辑 `.env` 文件内容**

```env
# ============================================================================
# 邮件服务配置（必填）
# ============================================================================
SMTP_USER=your-email@163.com
SMTP_PASS=your-163-authorization-code

# SMTP 服务器配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true

# ============================================================================
# 前端配置
# ============================================================================
VITE_API_URL=http://192.168.1.100:8787

# ============================================================================
# 端口配置
# ============================================================================
EMAIL_RELAY_PORT=3001
WEB_PORT=5173
API_PORT=8787

# ============================================================================
# 可选：Docker 资源限制
# ============================================================================
# MEMORY_LIMIT=512m
# CPU_LIMIT=0.5
```

**保存文件**:

```
按 Ctrl+X (如果用 nano)
输入 Y 确认保存
```

### 3️⃣ 验证文件结构

```bash
# 检查项目文件是否完整
ls -la /mnt/docker/tapcanvas/

应该看到:
-rwx  docker-compose.self-hosted.yml
-rwx  .env
drwx  apps/
drwx  docs/
drwx  packages/
...
```

---

## 第四步：部署服务

### 1️⃣ 进入项目目录

```bash
ssh admin@192.168.1.100

cd /mnt/docker/tapcanvas
```

### 2️⃣ 构建 Docker 镜像

```bash
# 构建邮件中转服务镜像
docker-compose -f docker-compose.self-hosted.yml build email-relay

# 预计耗时: 2-10 分钟（取决于网速和 NAS 性能）
```

**进度说明**:

```
Step 1/10 : FROM node:18-alpine
Step 2/10 : WORKDIR /app
...
Successfully tagged tapcanvas-email-relay:latest
```

### 3️⃣ 启动所有服务

```bash
# 后台启动所有服务
docker-compose -f docker-compose.self-hosted.yml up -d

# 查看启动日志（实时）
docker-compose -f docker-compose.self-hosted.yml logs -f
```

**预期输出**:

```
Creating tapcanvas-email-relay ... done
Creating tapcanvas-web ... done
```

### 4️⃣ 等待服务就绪

```bash
# 检查服务状态
docker-compose -f docker-compose.self-hosted.yml ps

# 应该看到:
NAME                    STATUS
tapcanvas-email-relay   Up (healthy)
tapcanvas-web           Up
```

**等待邮件服务就绪**:

```bash
# 反复检查直到显示 (healthy)
docker-compose -f docker-compose.self-hosted.yml logs email-relay | tail -20

# 应该看到:
✅ SMTP server is ready to take messages
```

---

## 第五步：验证服务

### 1️⃣ 检查邮件中转服务

```bash
# 使用 curl 测试
curl http://localhost:3001/health

# 应该返回:
{"status":"ok","service":"email-relay"}
```

### 2️⃣ 从 NAS 外部访问

**在你的电脑上**:

```bash
# 测试邮件服务 (替换 192.168.1.100 为你的 NAS IP)
curl http://192.168.1.100:3001/health

# 测试前端应用
# 在浏览器打开: http://192.168.1.100:5173
```

### 3️⃣ 发送测试邮件

```bash
# 在 NAS 上执行
curl -X POST http://localhost:3001/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@163.com",
    "code": "123456",
    "purpose": "signup"
  }'

# 应该返回:
{"success":true,"message":"Verification code sent successfully","messageId":"<xxx>"}

# 检查你的 163 邮箱，应该收到验证码邮件
```

### 4️⃣ 测试完整流程

**1. 注册账户**

```bash
curl -X POST http://192.168.1.100:8787/auth/email/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@163.com",
    "password": "TestPass123",
    "code": "123456",
    "name": "Test User"
  }'

# 应该返回 JWT token
```

**2. 登录账户**

```bash
curl -X POST http://192.168.1.100:8787/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@163.com",
    "password": "TestPass123"
  }'

# 应该返回 JWT token
```

**3. 打开前端应用**

```
在浏览器打开: http://192.168.1.100:5173
应该看到登录界面
```

---

## 第六步：维护和管理

### 1️⃣ 查看服务日志

**查看所有服务日志**:

```bash
docker-compose -f docker-compose.self-hosted.yml logs -f
```

**查看特定服务日志**:

```bash
# 邮件服务
docker-compose -f docker-compose.self-hosted.yml logs -f email-relay

# 前端应用
docker-compose -f docker-compose.self-hosted.yml logs -f web
```

**查看过去一小时的日志**:

```bash
docker-compose -f docker-compose.self-hosted.yml logs --since 1h
```

### 2️⃣ 停止服务

```bash
# 停止所有服务（保留容器）
docker-compose -f docker-compose.self-hosted.yml stop

# 停止并删除容器（保留镜像和卷）
docker-compose -f docker-compose.self-hosted.yml down

# 停止并删除所有数据（谨慎使用！）
docker-compose -f docker-compose.self-hosted.yml down -v
```

### 3️⃣ 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.self-hosted.yml restart

# 重启特定服务
docker-compose -f docker-compose.self-hosted.yml restart email-relay
```

### 4️⃣ 更新项目

```bash
# 1. 拉取最新代码
cd /mnt/docker/tapcanvas
git pull  # 如果使用 git

# 2. 重新构建镜像
docker-compose -f docker-compose.self-hosted.yml build --no-cache

# 3. 启动新镜像
docker-compose -f docker-compose.self-hosted.yml up -d
```

### 5️⃣ 查看资源使用

```bash
# 查看实时资源占用
docker stats

# 查看磁盘空间
docker system df

# 清理未使用的镜像和容器
docker system prune -a
```

---

## 故障排查

### ❌ 问题 1: 无法连接到 NAS

**症状**: 浏览器提示无法连接 http://192.168.1.100:8080

**排查步骤**:

1. **检查 NAS 是否在线**
```bash
# 在电脑上 ping NAS
ping 192.168.1.100

# 应该看到回应
Reply from 192.168.1.100: bytes=32 time=5ms
```

2. **检查 NAS IP 地址**
```
在飞牛 App 中查看，或
登录路由器查看连接设备
```

3. **检查防火墙设置**
```
NAS 设置 → 网络设置 → 防火墙
确保 8080 端口未被阻止
```

---

### ❌ 问题 2: Docker 启动失败

**症状**: `docker: command not found` 或 `Cannot connect to Docker daemon`

**解决方案**:

1. **检查 Docker 是否安装**
```bash
docker --version

# 如果显示 command not found，需要安装 Docker
```

2. **重新安装 Docker**
```bash
# 在飞牛应用中心搜索并安装 Docker CE
```

3. **启动 Docker 服务**
```bash
# SSH 连接后执行
sudo systemctl start docker
sudo systemctl enable docker
```

---

### ❌ 问题 3: 邮件无法发送

**症状**: 邮件发送返回错误，或容器日志显示 SMTP 连接失败

**排查步骤**:

1. **检查环境变量**
```bash
# 查看 .env 文件
cat /mnt/docker/tapcanvas/.env

# 确保:
# - SMTP_USER 是正确的 163 邮箱
# - SMTP_PASS 是授权码（不是密码）
```

2. **检查邮件服务日志**
```bash
docker-compose -f docker-compose.self-hosted.yml logs email-relay

# 查看是否有 "connection refused" 或 "invalid login"
```

3. **测试 SMTP 连接**
```bash
# 进入邮件服务容器
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh

# 尝试连接 163 SMTP
telnet smtp.163.com 465
```

4. **重新生成 163 授权码**
```
如果授权码已泄露或忘记：
1. 登录 https://mail.163.com
2. 设置 → 账户安全
3. 点击"重新生成授权码"
4. 更新 .env 文件中的 SMTP_PASS
5. 重启服务
```

---

### ❌ 问题 4: 容器持续崩溃

**症状**: `docker ps` 中看不到运行的容器，或看到 `Exited` 状态

**排查步骤**:

1. **查看详细错误**
```bash
docker-compose -f docker-compose.self-hosted.yml up

# 不用 -d，直接查看错误消息
```

2. **查看容器日志**
```bash
docker logs tapcanvas-email-relay
```

3. **检查磁盘空间**
```bash
df -h

# 确保有足够的空间（至少 1GB）
```

4. **检查端口冲突**
```bash
# 检查 3001 端口是否被占用
sudo lsof -i :3001

# 如果被占用，修改 .env 中的 EMAIL_RELAY_PORT
```

---

### ❌ 问题 5: 无法访问前端应用

**症状**: 浏览器访问 http://192.168.1.100:5173 显示无法连接

**排查步骤**:

1. **检查容器是否运行**
```bash
docker-compose -f docker-compose.self-hosted.yml ps

# 应该看到 tapcanvas-web 是 Up 状态
```

2. **检查前端日志**
```bash
docker-compose -f docker-compose.self-hosted.yml logs web
```

3. **检查端口映射**
```bash
# 确保 5173 端口已暴露
docker port tapcanvas-web
```

4. **尝试从 NAS 本地访问**
```bash
ssh admin@192.168.1.100

# 在 NAS 上测试
curl http://localhost:5173
```

---

## 监控和日志

### 📊 查看容器状态

```bash
# 实时监控所有容器
docker stats

# 监控特定容器
docker stats tapcanvas-email-relay

# 应该看到:
CONTAINER             CPU %   MEM USAGE / LIMIT   NET I/O
tapcanvas-email-relay 0.1%   45MB / 512MB        100KB / 50KB
```

### 📝 导出日志

```bash
# 导出邮件服务日志
docker-compose -f docker-compose.self-hosted.yml logs email-relay > email-relay.log

# 导出所有服务日志
docker-compose -f docker-compose.self-hosted.yml logs > all-services.log

# 查看最后 100 行日志
docker-compose -f docker-compose.self-hosted.yml logs --tail=100
```

### 🔍 实时监听日志

```bash
# 监听所有服务日志（带时间戳）
docker-compose -f docker-compose.self-hosted.yml logs -f --timestamps

# 监听邮件服务日志（只看新日志）
docker-compose -f docker-compose.self-hosted.yml logs -f email-relay

# 按 Ctrl+C 停止监听
```

### 💾 日志管理

```bash
# 查看日志大小
du -sh /var/lib/docker/containers/*/

# 如果日志过大，可以限制日志大小
# 编辑 docker-compose.self-hosted.yml 中的 logging 配置
```

---

## 性能优化

### 💾 资源限制

**修改 `docker-compose.self-hosted.yml`**:

```yaml
email-relay:
  deploy:
    resources:
      limits:
        cpus: '0.5'           # 最多使用 50% CPU
        memory: 512M          # 最多使用 512MB 内存
      reservations:
        cpus: '0.25'          # 预留 25% CPU
        memory: 256M          # 预留 256MB 内存
```

### 🔄 自动重启策略

```yaml
email-relay:
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 5
    window: 120s
```

### 📦 容器打扫

```bash
# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune -a

# 删除未使用的卷
docker volume prune

# 删除未使用的网络
docker network prune
```

---

## 定期维护计划

### 每周

- ✅ 检查磁盘空间
- ✅ 查看容器日志，检查异常
- ✅ 测试邮件发送功能

### 每月

- ✅ 更新 Docker 镜像
- ✅ 检查 163 邮箱授权状态
- ✅ 清理过期日志

### 每季度

- ✅ 备份数据库
- ✅ 更新项目代码
- ✅ 安全审计

---

## 备份和恢复

### 📦 备份数据

```bash
# 备份数据卷
docker-compose -f docker-compose.self-hosted.yml exec -T email-relay \
  tar czf - /app/data > /backup/email-relay-backup.tar.gz

# 备份整个项目
cp -r /mnt/docker/tapcanvas /backup/tapcanvas-$(date +%Y%m%d)
```

### 🔄 恢复数据

```bash
# 恢复数据卷
docker-compose -f docker-compose.self-hosted.yml down

docker-compose -f docker-compose.self-hosted.yml up -d email-relay

docker exec -T tapcanvas-email-relay \
  tar xzf - /app/data < /backup/email-relay-backup.tar.gz
```

---

## 常用命令速查表

```bash
# ==================== 启动/停止 ====================
docker-compose -f docker-compose.self-hosted.yml up -d      # 启动
docker-compose -f docker-compose.self-hosted.yml down       # 停止
docker-compose -f docker-compose.self-hosted.yml restart    # 重启
docker-compose -f docker-compose.self-hosted.yml logs -f    # 查看日志

# ==================== 状态检查 ====================
docker-compose -f docker-compose.self-hosted.yml ps         # 容器状态
docker stats                                                 # 资源使用
docker logs <container_id>                                  # 容器日志

# ==================== 维护 ====================
docker-compose -f docker-compose.self-hosted.yml build      # 构建镜像
docker system prune -a                                      # 清理系统
docker volume ls                                            # 查看卷

# ==================== 调试 ====================
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh    # 进入容器
docker-compose -f docker-compose.self-hosted.yml config                 # 查看配置
```

---

## 安全建议

### 🔒 访问控制

```
1. 修改默认用户名密码
2. 启用防火墙，只允许必要的端口
3. 定期更新 Docker 和系统
4. 限制 NAS 外网访问
```

### 🔐 邮箱安全

```
1. 定期更换 163 授权码
2. 不要分享授权码
3. 如果授权码泄露，立即重新生成
4. 考虑为 163 邮箱启用两因素认证
```

### 📝 日志安全

```bash
# 定期清理旧日志
docker-compose -f docker-compose.self-hosted.yml logs --tail=0

# 加密备份
tar czf - backup/ | gpg --symmetric --cipher-algo AES256 > backup.tar.gz.gpg
```

---

## 获取帮助

### 📖 查看文档

- [快速开始指南](./QUICK_START.md)
- [完整部署指南](./docs/SELF_HOSTED_DEPLOYMENT.md)
- [邮件服务文档](./apps/email-relay/README.md)

### 🔍 查看日志

```bash
# 详细日志
docker-compose -f docker-compose.self-hosted.yml logs

# 导出日志便于分析
docker-compose -f docker-compose.self-hosted.yml logs > debug.log
```

### 💬 社区支持

- 飞牛 NAS 官方论坛
- Docker 官方文档
- GitHub Issues

---

## 预期结果

完成所有步骤后，你应该能够：

✅ 访问前端应用 (http://192.168.1.100:5173)  
✅ 正常发送和接收验证码邮件  
✅ 完成用户注册、登录、密码重置流程  
✅ 查看和管理容器日志  
✅ 根据需要扩展和维护系统  

---

## 总结

| 步骤 | 描述 | 预计时间 |
|------|------|----------|
| 第一步 | 访问飞牛 NAS | 5 分钟 |
| 第二步 | 启用 Docker | 5-10 分钟 |
| 第三步 | 配置项目 | 10 分钟 |
| 第四步 | 部署服务 | 10-20 分钟 |
| 第五步 | 验证服务 | 5 分钟 |
| **总计** | | **35-50 分钟** |

---

**🎉 祝部署顺利！**

如有问题，请查看[故障排查](#故障排查)部分或参考其他文档。

**最后更新**: 2026年1月4日
