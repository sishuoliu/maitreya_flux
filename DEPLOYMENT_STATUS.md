# Maitreya Site - 部署状态

## 最后更新
**时间**: 2026-02-13 13:20 CST
**操作**: 修复 Dana/中文/游戏 bug 并部署

## 生产环境
- **路径**: `/var/www/maitreya/`
- **服务**: `maitreya-api.service` (systemd)
- **端口**: 3001 (localhost only)
- **用户**: www-data
- **状态**: ✅ Running
- **自启**: ✅ Enabled
- **访问**: http://localhost:3001

## 快速命令

### 部署新版本
```bash
# 1. 在 workspace 修改代码
cd /home/ubuntu/.openclaw/workspace/maitreya-site

# 2. 测试（可选）
python3 -m http.server 8888 &
curl http://localhost:8888/

# 3. 提交
git add -A
git commit -m "描述"

# 4. 同步到生产
sudo rsync -av --delete /home/ubuntu/.openclaw/workspace/maitreya-site/ /var/www/maitreya/ --exclude='.git' --exclude='*.md'

# 5. 重启服务
sudo systemctl restart maitreya-api

# 6. 检查状态
sudo systemctl status maitreya-api
curl http://localhost:3001/
```

### 查看日志
```bash
sudo journalctl -u maitreya-api -f
sudo journalctl -u maitreya-api -n 50 --no-pager
```

### 服务管理
```bash
sudo systemctl start maitreya-api
sudo systemctl stop maitreya-api
sudo systemctl restart maitreya-api
sudo systemctl status maitreya-api
```

## 文件结构
```
/home/ubuntu/.openclaw/workspace/
├── maitreya-site/          # 开发环境（git repo）
│   ├── index.html
│   ├── void.html
│   ├── void-game.js
│   ├── api.py
│   └── ...
└── data/                   # 数据文件（API 读取）
    ├── samsara_counter.txt
    └── samsara_log.json

/var/www/maitreya/          # 生产环境（rsync 同步）
├── index.html
├── void.html
├── void-game.js
├── api.py
└── ...
```

## 最近修改
- 2026-02-13 13:20: 删除 Dana 区域，减少中文，修复游戏 bug
- 2026-02-13 13:20: api.py port 改回 3001（非 root）

## 待办
- [ ] 配置 Nginx 反向代理（如需公网访问）
- [ ] 配置 SSL（Let's Encrypt）
- [ ] 设置域名 DNS
