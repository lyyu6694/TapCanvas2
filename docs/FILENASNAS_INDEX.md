# 飞牛 NAS 部署文档完整索引

> **快速导航**: 在飞牛 NAS 上部署 TapCanvas 邮件认证系统的所有文档和指南

---

## 🚀 快速开始（从这里开始！）

### 新手入门
**首先阅读这个** ⭐⭐⭐⭐⭐

| 文档 | 内容 | 预计时间 |
|------|------|----------|
| [飞牛 NAS 部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) | 详细的逐步部署教程 | 1 小时 |
| [部署清单](./FILENASNAS_DEPLOYMENT_CHECKLIST.md) | 可打印的检查清单 | 打印使用 |

### 快速参考
**部署完成后需要时参考**

| 文档 | 内容 | 何时查看 |
|------|------|----------|
| [常见问题和优化](./FILENASNAS_TROUBLESHOOTING.md) | 问题排查和性能优化 | 遇到问题时 |
| [快速命令参考](../QUICK_START.md) | Docker 命令速查表 | 日常操作 |

---

## 📚 完整文档列表

### 第一阶段：部署前准备

#### 1. [飞牛 NAS 部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 📖
**内容**: 
- 系统要求检查
- 准备工作（163 邮箱、项目文件）
- SSH 连接和 Docker 启用
- 环境配置
- 服务部署
- 完整性验证
- 日常维护

**适合**: 首次部署的用户  
**难度**: ⭐⭐ 中等  
**预计时间**: 50 分钟

---

### 第二阶段：部署执行

#### 2. [部署清单](./FILENASNAS_DEPLOYMENT_CHECKLIST.md) ✅
**内容**:
- 部署前准备检查
- 6 大部署步骤检查
- 功能验证清单
- 系统状态检查
- 完成标记

**适合**: 部署期间对照  
**难度**: ⭐ 简单  
**使用方式**: 打印或保存在手机中

---

### 第三阶段：问题排查和优化

#### 3. [常见问题和优化](./FILENASNAS_TROUBLESHOOTING.md) 🔧
**内容**:
- 8 个常见问题及解决方案
- SSH 连接问题
- Docker 权限问题
- 镜像构建失败
- 邮件发送失败
- 前端无法访问
- 容器崩溃
- 磁盘空间不足
- 性能优化技巧
- 安全加固措施
- 监控和告警
- 高级配置（Nginx、备份等）

**适合**: 部署完成后需要时参考  
**难度**: ⭐⭐⭐ 较难  
**主要使用**: 遇到问题时的排查

---

## 🎯 按需求快速查找

### 我想...

#### 初次部署
1. 先读 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 的"系统要求"部分
2. 打印 [部署清单](./FILENASNAS_DEPLOYMENT_CHECKLIST.md)
3. 按照 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 的第一步到第六步逐步操作

#### 部署卡住了
1. 查看 [常见问题](./FILENASNAS_TROUBLESHOOTING.md) 中对应的问题
2. 如果还是不行，查看 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 中的"故障排查"部分
3. 检查日志：`docker-compose -f docker-compose.self-hosted.yml logs -f`

#### 邮件无法发送
1. 查看 [常见问题](./FILENASNAS_TROUBLESHOOTING.md) → "Q5: 邮件发送失败"
2. 检查 163 授权码是否正确
3. 查看 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) → "第五步：验证服务"

#### 性能太慢或资源占用太高
1. 查看 [常见问题](./FILENASNAS_TROUBLESHOOTING.md) → "性能优化"
2. 按照指南调整容器资源限制
3. 清理 Docker 系统缓存

#### 一切正常，如何维护
1. 查看 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) → "第六步：维护和管理"
2. 设置定期检查计划
3. 参考 [常见问题](./FILENASNAS_TROUBLESHOOTING.md) → "监控告警"

---

## 📋 文档导航图

```
┌─ 飞牛 NAS 部署文档
│
├─ 🚀 快速开始
│  ├─ 部署指南 (FILENASNAS_DEPLOYMENT_GUIDE.md)
│  │  ├─ 系统要求
│  │  ├─ 准备工作
│  │  ├─ 6 大部署步骤
│  │  ├─ 验证服务
│  │  ├─ 维护管理
│  │  ├─ 故障排查
│  │  └─ 监控日志
│  │
│  └─ 部署清单 (FILENASNAS_DEPLOYMENT_CHECKLIST.md)
│     ├─ 准备检查
│     ├─ 6 步检查
│     ├─ 功能验证
│     └─ 完成确认
│
├─ 🔧 问题排查
│  └─ 常见问题和优化 (FILENASNAS_TROUBLESHOOTING.md)
│     ├─ 8 个常见问题
│     ├─ 快速参考
│     ├─ 性能优化
│     ├─ 安全加固
│     ├─ 监控告警
│     └─ 高级配置
│
└─ 📖 其他文档
   ├─ 快速开始指南 (QUICK_START.md)
   ├─ 完整部署指南 (docs/SELF_HOSTED_DEPLOYMENT.md)
   ├─ 邮件服务文档 (apps/email-relay/README.md)
   └─ 实现完成总结 (IMPLEMENTATION_COMPLETE.md)
```

---

## 🔑 关键命令速查

### 基础命令

```bash
# 启动服务
docker-compose -f docker-compose.self-hosted.yml up -d

# 查看状态
docker-compose -f docker-compose.self-hosted.yml ps

# 查看日志
docker-compose -f docker-compose.self-hosted.yml logs -f

# 停止服务
docker-compose -f docker-compose.self-hosted.yml down

# 重启服务
docker-compose -f docker-compose.self-hosted.yml restart
```

### 故障排查

```bash
# 查看特定服务日志
docker-compose -f docker-compose.self-hosted.yml logs email-relay

# 进入容器调试
docker-compose -f docker-compose.self-hosted.yml exec email-relay sh

# 测试邮件服务
curl http://localhost:3001/health

# 测试前端应用
curl http://localhost:5173
```

### 系统维护

```bash
# 查看资源占用
docker stats

# 清理系统
docker system prune -a

# 查看磁盘使用
df -h
du -sh /var/lib/docker/

# 更新服务
docker-compose -f docker-compose.self-hosted.yml build --no-cache
```

---

## 📞 问题排查流程图

```
遇到问题
  │
  ├─ SSH 无法连接
  │  └─ 查看部署指南 → 故障排查 → 问题 1
  │
  ├─ Docker 无法使用
  │  └─ 查看常见问题 → Q1, Q2, Q3
  │
  ├─ 镜像构建失败
  │  └─ 查看常见问题 → Q4
  │
  ├─ 邮件无法发送
  │  └─ 查看常见问题 → Q5
  │
  ├─ 前端无法访问
  │  └─ 查看常见问题 → Q6
  │
  ├─ 容器频繁崩溃
  │  └─ 查看常见问题 → Q7
  │
  ├─ 磁盘空间不足
  │  └─ 查看常见问题 → Q8
  │
  └─ 检查日志
     └─ docker-compose logs -f
```

---

## ✅ 分阶段学习路线

### 阶段 1: 部署前（1 小时）
1. 阅读 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 的前 3 部分
2. 准备 163 邮箱授权码
3. 准备项目文件
4. **预计时间**: 1 小时

### 阶段 2: 部署中（1 小时）
1. 按照 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 第 4-6 步操作
2. 对照 [部署清单](./FILENASNAS_DEPLOYMENT_CHECKLIST.md) 逐项检查
3. 测试完整流程
4. **预计时间**: 1 小时

### 阶段 3: 部署后（30 分钟）
1. 按照 [部署指南](./FILENASNAS_DEPLOYMENT_GUIDE.md) 设置维护计划
2. 浏览 [常见问题](./FILENASNAS_TROUBLESHOOTING.md) 了解可能的问题
3. 设置监控告警
4. **预计时间**: 30 分钟

**总计**: 2.5 小时完全掌握

---

## 📊 文档对照表

| 需求 | 文档位置 | 章节 |
|------|----------|------|
| 了解系统要求 | 部署指南 | 系统要求 |
| 获取 163 授权码 | 部署指南 | 准备工作 |
| 启用 Docker | 部署指南 | 第二步 |
| 配置环境变量 | 部署指南 | 第三步 |
| 构建镜像 | 部署指南 | 第四步 |
| 启动服务 | 部署指南 | 第四步 |
| 验证服务 | 部署指南 | 第五步 |
| 日常维护 | 部署指南 | 第六步 |
| SSH 问题 | 常见问题 | Q1 |
| Docker 权限问题 | 常见问题 | Q2 |
| docker-compose 命令不存在 | 常见问题 | Q3 |
| 镜像构建失败 | 常见问题 | Q4 |
| 邮件发送失败 | 常见问题 | Q5 |
| 前端无法访问 | 常见问题 | Q6 |
| 容器崩溃 | 常见问题 | Q7 |
| 磁盘空间不足 | 常见问题 | Q8 |
| 性能优化 | 常见问题 | 性能优化 |
| 安全加固 | 常见问题 | 安全加固 |
| 监控告警 | 常见问题 | 监控告警 |

---

## 🎓 学习资源

### 官方文档
- [飞牛 NAS 官网](https://www.filenasnas.com)
- [Docker 官方文档](https://docs.docker.com)
- [Docker Compose 文档](https://docs.docker.com/compose)

### 常用工具
- **SSH 客户端**: PuTTY, Windows Terminal, iTerm2
- **文件传输**: FileZilla, WinSCP
- **文本编辑器**: nano, vi/vim, Sublime Text

### 相关命令
- `ssh` - 远程连接
- `docker` - 容器管理
- `docker-compose` - 容器编排
- `curl` - 测试 HTTP 请求
- `telnet` - 测试网络连接

---

## 💡 最佳实践

### Do ✅
- ✅ 定期备份 `.env` 文件
- ✅ 保存 163 授权码到安全的地方
- ✅ 定期检查容器日志
- ✅ 监控磁盘空间
- ✅ 设置自动告警
- ✅ 保持 Docker 和系统更新
- ✅ 记录部署过程
- ✅ 建立监控计划

### Don't ❌
- ❌ 不要将 `.env` 提交到 Git
- ❌ 不要分享 163 授权码
- ❌ 不要忽视容器日志中的错误
- ❌ 不要随意删除 Docker 卷
- ❌ 不要在生产环境禁用防火墙
- ❌ 不要使用默认密码
- ❌ 不要长期忽视告警
- ❌ 不要在没有备份的情况下执行 prune

---

## 🆘 获取帮助

### 自助排查
1. 查看 [常见问题](./FILENASNAS_TROUBLESHOOTING.md)
2. 搜索日志中的错误信息
3. 查看 Docker 官方文档
4. 在 GitHub Issues 中搜索

### 获取专业帮助
1. 准备完整的日志：`docker-compose logs > debug.log`
2. 列出系统信息：`docker version`, `docker system df`
3. 描述问题和尝试过的解决方案
4. 提供 `.env` 文件的脱敏版本

---

## 📝 版本信息

| 组件 | 版本 |
|------|------|
| TapCanvas | 2026.01 |
| Docker | 20.10+ |
| Docker Compose | 1.29+ |
| Node.js | 18-alpine |
| 文档更新 | 2026年1月4日 |

---

**祝部署顺利！** 🚀

有任何问题，请先查看相应的文档。如果问题仍未解决，请准备完整的日志和系统信息后寻求帮助。
