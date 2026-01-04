# 飞牛 NAS 部署常见问题和优化

## 📋 目录

1. [常见问题](#常见问题)
2. [性能优化](#性能优化)
3. [安全加固](#安全加固)
4. [监控告警](#监控告警)
5. [高级配置](#高级配置)
6. [快速参考](#快速参考)

---

## 常见问题

### Q1: SSH 连接时提示"permission denied"

**现象**:
```
permission denied (publickey,password).
```

**原因**: 密码错误或 SSH 服务未启用

**解决方案**:

1. **检查 SSH 是否启用**
```
在飞牛 Web 管理界面:
设置 → 网络设置 → SSH
确保 SSH 已启用并记住端口号
```

2. **验证密码**
```bash
# 确保使用了正确的密码
# 默认用户: admin
# 默认密码: 飞牛
# 
# 如果密码错误，可在飞牛 Web 界面重置
```

3. **尝试不同的 SSH 客户端**
```bash
# Linux/Mac
ssh -v admin@192.168.1.100  # 显示详细信息

# Windows
# 使用 PuTTY 或 Windows Terminal
```

4. **重启 SSH 服务**
```bash
# 在飞牛 Web 管理界面禁用再启用 SSH
```

---

### Q2: Docker 命令提示 permission denied

**现象**:
```
permission denied while trying to connect to Docker daemon
```

**原因**: 当前用户没有 Docker 权限

**解决方案**:

```bash
# 方案 1: 使用 sudo
sudo docker ps

# 方案 2: 将用户添加到 docker 组
sudo usermod -aG docker admin
# 然后重新登录 SSH

# 方案 3: 使用 root 登录
ssh root@192.168.1.100
```

---

### Q3: docker-compose 命令不存在

**现象**:
```
bash: docker-compose: command not found
```

**原因**: Docker Compose 未安装或不在 PATH 中

**解决方案**:

```bash
# 检查安装
which docker-compose

# 如果没有，手动安装
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

---

### Q4: 镜像构建缓慢或失败

**现象**:
```
ERROR: failed to solve with frontend dockerfile.v0
```

**原因**: 
- 网络连接不稳定
- npm 依赖下载超时
- 磁盘空间不足

**解决方案**:

```bash
# 1. 检查网络连接
ping 8.8.8.8

# 2. 检查磁盘空间
df -h

# 3. 清理 Docker 缓存
docker builder prune
docker system prune -a

# 4. 重新构建（可能需要较长时间）
docker-compose -f docker-compose.self-hosted.yml build --no-cache

# 5. 使用镜像加速（如果网络慢）
# 编辑 /etc/docker/daemon.json，添加国内镜像源
# 然后重启 Docker
```

---

### Q5: 邮件发送失败，日志显示 ECONNREFUSED

**现象**:
```
Error: connect ECONNREFUSED 127.0.0.1:25
SMTP connection failed
```

**原因**: 无法连接到 163 SMTP 服务器

**解决方案**:

```bash
# 1. 检查 .env 文件配置
cat /mnt/docker/tapcanvas/.env | grep SMTP

# 应该看到:
# SMTP_HOST=smtp.163.com
# SMTP_PORT=465
# SMTP_SECURE=true
# SMTP_USER=your-email@163.com
# SMTP_PASS=your-auth-code

# 2. 查看邮件服务日志
docker-compose -f docker-compose.self-hosted.yml logs email-relay | tail -50

# 3. 测试 SMTP 连接
docker-compose -f docker-compose.self-hosted.yml exec email-relay telnet smtp.163.com 465

# 如果显示 "Connected"，则连接正常

# 4. 验证授权码
# 确保使用的是授权码，不是密码
# 如果不确定，在 163 邮箱重新生成一个
```

---

### Q6: 访问前端时显示"页面不存在"或"连接被拒绝"

**现象**:
```
Firefox 无法连接到 192.168.1.100:5173
```

**原因**:
- 容器未运行
- 端口映射错误
- 防火墙阻止

**解决方案**:

```bash
# 1. 检查容器运行状态
docker-compose -f docker-compose.self-hosted.yml ps

# 应该看到所有容器都是 "Up"

# 2. 如果容器显示 "Exited"，查看错误日志
docker logs tapcanvas-web

# 3. 检查端口映射
docker port tapcanvas-web
# 应该显示 5173/tcp -> 0.0.0.0:5173

# 4. 检查防火墙
# 在飞牛设置中检查防火墙规则
# 确保 5173 端口未被阻止

# 5. 从 NAS 本地测试
curl http://localhost:5173
# 如果返回 HTML，说明容器正常运行

# 6. 尝试用 NAS 的 IP 地址访问
# 而不是 localhost
http://192.168.1.100:5173

# 7. 重启容器
docker-compose -f docker-compose.self-hosted.yml restart web
```

---

### Q7: 容器随机崩溃或自动重启

**现象**:
```
容器在运行一段时间后突然停止
docker-compose ps 显示 "Restarting"
```

**原因**:
- 内存不足
- CPU 使用过高
- 文件系统问题
- 应用出现 Bug

**解决方案**:

```bash
# 1. 检查系统资源
docker stats

# 查看内存和 CPU 使用情况
# 如果某个容器占用过高，可能需要重新配置

# 2. 查看容器日志
docker-compose -f docker-compose.self-hosted.yml logs email-relay | tail -100

# 3. 检查系统日志
dmesg | tail -20

# 4. 增加容器内存限制
# 编辑 docker-compose.self-hosted.yml
# 在容器配置中添加:
# deploy:
#   resources:
#     limits:
#       memory: 1G

# 5. 增加 NAS 的 swap 空间（如果内存不足）
# 这需要更高级的配置

# 6. 重启 NAS
sudo reboot
```

---

### Q8: 磁盘空间告急

**现象**:
```
df -h 显示磁盘接近满
容器无法启动或运行缓慢
```

**原因**: Docker 容器和日志占用过多空间

**解决方案**:

```bash
# 1. 查看磁盘使用情况
df -h
du -sh /var/lib/docker/

# 2. 清理 Docker 系统
# 删除停止的容器
docker container prune

# 删除未使用的镜像
docker image prune -a

# 删除未使用的卷
docker volume prune

# 一键清理所有未使用的资源
docker system prune -a

# 3. 清理日志
# 查看日志大小
du -sh /var/lib/docker/containers/*/

# 限制日志大小（修改 docker-compose.self-hosted.yml）
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"

# 4. 删除旧容器
docker container ls -a
docker rm <container_id>

# 5. 移动 Docker 数据目录到更大的分区（高级）
# 需要修改 /etc/docker/daemon.json
# "data-root": "/path/to/larger/disk"
```

---

## 性能优化

### 1️⃣ CPU 和内存优化

**查看当前使用情况**:
```bash
docker stats --no-stream

# 持续监控
docker stats
```

**限制资源使用**:

修改 `docker-compose.self-hosted.yml`:

```yaml
email-relay:
  deploy:
    resources:
      limits:
        cpus: '0.5'        # 限制 CPU 为 50%
        memory: 512M       # 限制内存为 512MB
      reservations:
        cpus: '0.25'       # 预留 CPU 25%
        memory: 256M       # 预留内存 256MB

  restart: unless-stopped
```

**然后重启**:
```bash
docker-compose -f docker-compose.self-hosted.yml up -d
```

---

### 2️⃣ 网络优化

**使用主机网络模式** (仅用于开发):
```yaml
email-relay:
  network_mode: "host"  # 直接使用 NAS 网络，性能更好
```

**注意**: 生产环境不推荐使用

---

### 3️⃣ 存储优化

**使用本地磁盘挂载**:

```yaml
volumes:
  email-relay-logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/disk1/tapcanvas-logs  # 使用 NAS 的快速磁盘
```

---

### 4️⃣ 日志优化

**减少日志输出量**:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "5m"      # 单个日志文件最大 5MB
    max-file: "3"       # 最多保留 3 个日志文件
    labels: "com.example.vendor=Acme"
```

---

## 安全加固

### 🔒 防火墙配置

**只允许必要的端口**:

```bash
# 在飞牛 NAS 设置中
设置 → 防火墙

启用防火墙
添加入站规则:
  - 允许 SSH (端口 22)
  - 允许 Web (端口 5173)
  - 允许 API (端口 8787)
  - 允许邮件服务 (端口 3001)

阻止其他所有入站连接
```

### 🔐 定期更新

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新 Docker
docker system info

# 重新构建镜像以获取最新基础镜像
docker-compose -f docker-compose.self-hosted.yml build --pull --no-cache
```

### 📝 日志审计

```bash
# 定期检查日志中的错误
docker-compose -f docker-compose.self-hosted.yml logs --since 24h | grep -i error

# 导出日志进行备份
docker-compose -f docker-compose.self-hosted.yml logs > logs/backup-$(date +%Y%m%d).log
```

### 🔑 密钥管理

```bash
# 不要在日志中显示敏感信息
# 检查 .env 文件的权限
ls -la /mnt/docker/tapcanvas/.env
# 应该是 -rw------- 或 -rw-r--r--

# 限制权限
chmod 600 /mnt/docker/tapcanvas/.env

# 定期备份 .env 到安全位置
cp /mnt/docker/tapcanvas/.env /backup/.env.backup
```

---

## 监控告警

### 📊 实时监控

**使用 Portainer** (可视化容器管理):

```bash
# 安装 Portainer
docker run -d \
  --name portainer \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8000:8000 \
  -p 9000:9000 \
  portainer/portainer-ce:latest

# 访问 http://192.168.1.100:9000
```

### 📈 资源监控脚本

创建 `monitor.sh`:

```bash
#!/bin/bash

# 每小时检查一次容器状态
while true; do
  echo "=== $(date) ==="
  
  # 检查容器状态
  docker-compose -f docker-compose.self-hosted.yml ps
  
  # 显示资源使用
  docker stats --no-stream
  
  # 检查磁盘使用
  echo "Disk Usage:"
  df -h | grep -E "^/dev/|^Filesystem"
  
  echo ""
  sleep 3600  # 每小时检查一次
done
```

**运行监控脚本**:

```bash
chmod +x monitor.sh
nohup ./monitor.sh > monitor.log 2>&1 &
```

### 🔔 告警规则

**邮件服务不可用时告警**:

```bash
#!/bin/bash

# 每 5 分钟检查一次服务
while true; do
  if ! curl -s http://localhost:3001/health | grep -q "ok"; then
    echo "WARNING: Email relay service is down!" | \
      mail -s "TapCanvas Alert: Email Service Down" admin@example.com
  fi
  sleep 300
done
```

---

## 高级配置

### 🌐 Nginx 反向代理

**安装 Nginx**:

```bash
# 在飞牛应用中心安装 Nginx

# 或使用 Docker
docker run -d \
  --name nginx-proxy \
  -p 80:80 \
  -p 443:443 \
  -v /mnt/docker/nginx:/etc/nginx \
  nginx:latest
```

**配置文件** (`/mnt/docker/nginx/nginx.conf`):

```nginx
upstream tapcanvas_web {
  server tapcanvas-web:5173;
}

upstream tapcanvas_api {
  server localhost:8787;
}

upstream email_relay {
  server tapcanvas-email-relay:3001;
}

server {
  listen 80;
  server_name 192.168.1.100;

  location / {
    proxy_pass http://tapcanvas_web;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }

  location /api {
    proxy_pass http://tapcanvas_api;
  }

  location /email {
    proxy_pass http://email_relay;
  }
}
```

### 📧 邮件监控和备份

**启用邮件日志**:

```bash
# 在 apps/email-relay/.env 中添加
LOG_LEVEL=debug
LOG_DIR=/app/logs

# 查看日志
docker-compose -f docker-compose.self-hosted.yml exec email-relay ls -la /app/logs
```

**定期备份日志**:

```bash
# 创建备份脚本
#!/bin/bash
BACKUP_DIR=/mnt/backup
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose -f docker-compose.self-hosted.yml logs > \
  $BACKUP_DIR/tapcanvas_logs_$DATE.log

# 保留最近 30 天的备份
find $BACKUP_DIR -name "tapcanvas_logs_*" -mtime +30 -delete
```

---

## 快速参考

### 常用命令

```bash
# ==================== 查看状态 ====================
docker-compose -f docker-compose.self-hosted.yml ps    # 容器状态
docker stats                                            # 资源占用
docker-compose -f docker-compose.self-hosted.yml logs -f  # 实时日志

# ==================== 重启和维护 ====================
docker-compose -f docker-compose.self-hosted.yml restart       # 重启所有
docker-compose -f docker-compose.self-hosted.yml restart email-relay  # 重启单个
docker system prune -a                                  # 清理系统
docker-compose -f docker-compose.self-hosted.yml down   # 停止并删除容器

# ==================== 调试 ====================
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh    # 进入容器
docker-compose -f docker-compose.self-hosted.yml config                 # 查看配置
docker inspect <container_id>                           # 查看容器详情

# ==================== 备份恢复 ====================
docker-compose -f docker-compose.self-hosted.yml exec -T email-relay \
  tar czf - /app > backup.tar.gz                       # 备份
docker-compose -f docker-compose.self-hosted.yml exec -T email-relay \
  tar xzf - /app < backup.tar.gz                       # 恢复
```

### 问题自查清单

```
[ ] 检查网络连接
[ ] 检查磁盘空间
[ ] 查看容器日志
[ ] 检查端口占用
[ ] 验证 .env 配置
[ ] 检查防火墙规则
[ ] 重启 Docker 服务
[ ] 重启 NAS
[ ] 查看系统日志
[ ] 联系技术支持
```

---

## 📞 需要帮助

1. **查看日志**: `docker-compose logs -f`
2. **查看配置**: `docker-compose config`
3. **进入容器**: `docker-compose exec email-relay sh`
4. **搜索问题**: 在 GitHub Issues 中搜索关键词
5. **联系支持**: 提供完整的日志和配置信息

---

**最后更新**: 2026年1月4日
