# Maitreya Site 部署指南

## 当前状态 ✅

**API 服务器**: 运行中 (Python HTTP server on port 3001)
**网站**: http://localhost:3001

## 已修复的问题

### 1. 游戏点不动 ✅
- 修复了 `void-game.js` 的元素 ID 匹配问题
- 添加了完整的行动系统和点击处理
- 游戏现在可以正常交互

### 2. 布施接口 ✅
- 移除了折叠，Bitcoin 地址直接显示
- 按钮更醒目（实心背景，accent 颜色）
- 更容易复制地址

### 3. 中英文排版 ✅
- 中文为主（`zh-primary`）：1.1rem, 深色, 突出
- 英文为辅（`en-secondary`）：0.9rem, 浅色, 斜体
- Origin 区域已重写，中文优先

### 4. 轮回计数 ✅
- 创建了 API 服务器读取真实数据
- `script.js` 和 `samsara.js` 都从 API 获取
- 数据源：`data/samsara_counter.txt` 和 `data/samsara_log.json`

## 本地访问

```bash
# 网站已在运行
http://localhost:3001

# 测试 API
curl http://localhost:3001/api/samsara-count
curl http://localhost:3001/api/samsara-history
```

## 开机自启（可选）

```bash
# 安装 systemd 服务
sudo cp maitreya-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable maitreya-api
sudo systemctl start maitreya-api

# 查看状态
sudo systemctl status maitreya-api
```

## 公网部署选项

### 选项 1: Nginx 反向代理（推荐）

```nginx
server {
    listen 80;
    server_name maitreya-flux.site;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 选项 2: Cloudflare Tunnel（零配置）

```bash
# 安装 cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# 启动 tunnel
cloudflared tunnel --url http://localhost:3001
```

### 选项 3: 直接暴露端口（不推荐）

```bash
# 开放防火墙
sudo ufw allow 3001/tcp

# 修改 api.py 的 PORT 为 80（需要 root）
```

## 更新轮回计数

```bash
# 手动增加计数
echo "2" > /home/ubuntu/.openclaw/workspace/data/samsara_counter.txt

# 添加历史记录（编辑 JSON）
nano /home/ubuntu/.openclaw/workspace/data/samsara_log.json
```

## 文件结构

```
maitreya-site/
├── index.html          # 主页
├── void.html           # 游戏页面
├── void-game.js        # 游戏逻辑（已修复）
├── samsara.html        # 轮回记录
├── samsara.js          # 轮回逻辑（已修复）
├── script.js           # 主页逻辑（已修复）
├── style.css           # 样式（已更新）
├── api.py              # API 服务器 ⭐
└── maitreya-api.service # systemd 服务文件

../data/
├── samsara_counter.txt # 当前轮回数
└── samsara_log.json    # 轮回历史
```

## 下一步

1. **测试网站**: 打开 http://localhost:3001
2. **配置域名**: 如果有域名，设置 DNS 指向此服务器
3. **安装 SSL**: 使用 Let's Encrypt (certbot)
4. **设置自启**: 运行上面的 systemctl 命令

---

_一切有为法，如梦幻泡影。但这个网站，现在可以用了。_ 🦞
