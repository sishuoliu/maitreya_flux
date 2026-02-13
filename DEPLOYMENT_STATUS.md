# Maitreya Site - 部署状态

## 最后更新
**时间**: 2026-02-13 13:56 CST
**操作**: 游戏嵌入主页 + DNS 配置

## 服务器信息
- **公网 IP**: 43.156.77.231
- **域名**: maitreya-flux.site (⏳ 等待 DNS 配置)
- **直接访问**: http://43.156.77.231/

## 生产环境
- **路径**: `/var/www/maitreya/`
- **服务**: `maitreya-api.service` (systemd)
- **端口**: 3001 (localhost only)
- **Web 服务器**: Nginx (port 80)
- **用户**: www-data
- **状态**: ✅ Running
- **自启**: ✅ Enabled

## 最新功能
- ✅ Void Game 嵌入主页（"戏 — Play" section）
- ✅ 游戏 UI 完整（stats, scene, choices, reflection）
- ✅ 响应式设计（移动端友好）
- ✅ 全屏版本链接（void.html）

## DNS 配置（待完成）

**需要在域名注册商添加：**
```
类型: A
名称: @
值: 43.156.77.231
```

详见：`DNS_SETUP.md`

## 快速命令

### 部署新版本
```bash
# 1. 在 workspace 修改代码
cd /home/ubuntu/.openclaw/workspace/maitreya-site

# 2. 提交到 git
git add -A
git commit -m "描述"
git push origin main

# 3. 同步到生产
sudo rsync -av --delete /home/ubuntu/.openclaw/workspace/maitreya-site/ /var/www/maitreya/ --exclude='.git' --exclude='*.md'

# 4. 重启服务
sudo systemctl restart maitreya-api

# 5. 检查状态
sudo systemctl status maitreya-api
curl http://localhost:3001/
```

### 查看日志
```bash
# API 日志
sudo journalctl -u maitreya-api -f

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 服务管理
```bash
# API 服务
sudo systemctl restart maitreya-api
sudo systemctl status maitreya-api

# Nginx
sudo systemctl reload nginx
sudo nginx -t
```

## 文件结构
```
/home/ubuntu/.openclaw/workspace/
├── maitreya-site/          # 开发环境（git repo）
│   ├── index.html          # ✅ 已嵌入游戏
│   ├── void.html           # 全屏游戏
│   ├── void-game.js        # 游戏逻辑
│   ├── api.py
│   └── ...
└── data/                   # 数据文件（API 读取）
    ├── samsara_counter.txt
    └── samsara_log.json

/var/www/maitreya/          # 生产环境（rsync 同步）
├── index.html              # ✅ 最新版本
├── void.html
├── void-game.js
├── api.py
└── ...
```

## 最近修改
- 2026-02-13 13:56: 游戏嵌入主页 + Nginx 域名配置
- 2026-02-13 13:20: 删除 Dana 区域，减少中文，修复游戏 bug
- 2026-02-13 13:20: api.py port 改回 3001（非 root）

## 待办
- [ ] 配置域名 DNS（用户操作）
- [ ] 配置 SSL（DNS 生效后）
- [ ] 测试游戏在移动端表现
